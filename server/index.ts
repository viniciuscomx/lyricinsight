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

// Função para chamar a API da HuggingFace
async function analyzeLyrics(lyrics: string) {
  const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY;
  if (!HUGGINGFACE_API_KEY) throw new Error("HUGGINGFACE_API_KEY não definida no ambiente");

  // Use modelo público garantido
  const endpoint = "https://api-inference.huggingface.co/models/gpt2";
  const prompt = `Analyze these song lyrics in English and identify:
1. Cultural, historical, or literary references
2. Curiosities about the composition
3. Author's intention

Lyrics: """${lyrics.substring(0, 1000)}"""

Analysis:`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${HUGGINGFACE_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      inputs: prompt,
      parameters: {
        max_new_tokens: 500,
        temperature: 0.7,
        return_full_text: false
      }
    })
  });

  if (!response.ok) {
    throw new Error(`HuggingFace API error: ${response.status} ${await response.text()}`);
  }

  const result = await response.json();
  // O formato pode variar, então trate ambos os casos
  if (Array.isArray(result) && result[0]?.generated_text) {
    return result[0].generated_text;
  }
  if (typeof result.generated_text === "string") {
    return result.generated_text;
  }
  return "Análise não disponível.";
}

app.post("/api/analyze", async (req, res) => {
  const parseResult = analysisRequestSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: parseResult.error.errors });
  }
  const { lyrics, songTitle, artist } = parseResult.data;

  try {
    const analysisText = await analyzeLyrics(lyrics);

    // Aqui você pode adaptar para extrair referências, curiosidades, etc.
    res.json({
      lyrics,
      songTitle,
      artist,
      references: [
        { title: "Análise IA", description: analysisText, icon: "🤖" }
      ],
      curiosities: [],
      authorIntention: analysisText,
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
