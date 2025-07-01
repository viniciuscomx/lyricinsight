import "dotenv/config";
import express, { type Request, Response, NextFunction } from "express";
import helmet from "helmet";
import compression from "compression";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import cors from "cors";
import { analysisRequestSchema } from "../shared/schema";
import fetch from "node-fetch";

const app = express();
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

// Logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }
      log(logLine);
    }
  });
  next();
});

// Função para chamar a API do Gemini e segmentar a análise corretamente
async function analyzeLyrics(lyrics: string) {
  const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
  if (!GOOGLE_API_KEY) throw new Error("GOOGLE_API_KEY não definida no ambiente");

  const endpoint = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${GOOGLE_API_KEY}`;
  const prompt = `Analise a letra da música abaixo de forma detalhada, criativa e envolvente.
Para cada item, escreva de 4 a 7 frases, trazendo contexto, interpretações e possíveis significados.
Evite respostas genéricas. Seja específico e aprofunde a análise, mas mantenha o texto claro e agradável.
Se não houver informações relevantes, responda "Nenhuma encontrada".

1. Referências culturais, históricas ou literárias (se houver)
2. Curiosidades sobre a composição (se houver)
3. Intenção do autor

Letra: """${lyrics.substring(0, 1000)}"""

Responda no formato, cada item em uma linha:
Referências: ... (adicione um emoji relacionado ao conteúdo)
Curiosidades: ... (adicione um emoji relacionado ao conteúdo)
Intenção do autor: ... (adicione um emoji relacionado ao conteúdo)
`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: prompt }
          ]
        }
      ]
    })
  });

  if (!response.ok) {
    let errorText = await response.text();
    throw new Error(`Erro ao acessar modelo Gemini: ${response.status} ${errorText}`);
  }

  const result = await response.json();
  const analysisText = result?.candidates?.[0]?.content?.parts?.[0]?.text || "Análise não disponível.";

  // Extrai blocos segmentados e ignora texto extra
  const extractBlockAndIcon = (label: string, defaultIcon: string) => {
    // Pega só a linha do label até o próximo label ou fim do texto
    const regex = new RegExp(`${label}:\\s*([\\s\\S]*?)([\\u2600-\\u27BF\\u1F300-\\u1F6FF\\u1F900-\\u1F9FF\\u1FA70-\\u1FAFF])?\\s*(?=\\n|$)`, "iu");
    const match = analysisText.match(regex);
    let description = match ? match[1].trim() : "Nenhuma encontrada.";
    // Remove emoji do final do texto, se presente
    description = description.replace(/[\u2600-\u27BF\u1F300-\u1F6FF\u1F900-\u1F9FF\u1FA70-\u1FAFF]+$/g, "").trim();
    // Tenta pegar emoji do texto, senão usa o padrão
    const iconMatch = match && match[2] ? match[2] : defaultIcon;
    return { description, icon: iconMatch };
  };

  const ref = extractBlockAndIcon("Referências", "🔗");
  const cur = extractBlockAndIcon("Curiosidades", "💡");
  const intent = extractBlockAndIcon("Intenção do autor", "📝");

  return {
    references: [
      {
        title: "Referências",
        description: ref.description,
        icon: ref.icon
      }
    ],
    curiosities: [
      {
        title: "Curiosidades",
        description: cur.description,
        icon: cur.icon
      }
    ],
    authorIntention: `${intent.icon} ${intent.description}`
  };
}

app.post("/api/analyze", async (req, res) => {
  const parseResult = analysisRequestSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: parseResult.error.errors });
  }
  const { lyrics, songTitle, artist } = parseResult.data;

  try {
    const analysis = await analyzeLyrics(lyrics);

    res.json({
      lyrics,
      songTitle,
      artist,
      references: analysis.references,
      curiosities: analysis.curiosities,
      authorIntention: analysis.authorIntention,
      createdAt: new Date().toISOString()
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Erro ao analisar letra" });
  }
});

(async () => {
  // Register API routes
  const server = await registerRoutes(app);

  // Error handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
  });

  // Setup Vite in development, serve static in production
  if (app.get("env") === "development") {
    // O Vite deve ser o último middleware, depois das rotas da API
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Start server
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();

// npm start
