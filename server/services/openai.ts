// Using Gemini API for text generation

// Adiciona fetch para Node.js se necessário
// Remova/comment se já estiver disponível globalmente (Node 18+)
// // npm install node-fetch

// Use a mesma variável de ambiente do restante do projeto
const HF_API_KEY = process.env.HUGGINGFACE_API_KEY;
// Troque para um modelo público disponível
const HF_API_URL = "https://api-inference.huggingface.co/models/distilgpt2";

export interface AnalysisResult {
  songTitle?: string;
  artist?: string;
  references: Array<{
    title: string;
    description: string;
    icon: string;
  }>;
  curiosities: Array<{
    title: string;
    description: string;
    icon: string;
  }>;
  authorIntention: string;
}

// Substitua toda a lógica de HuggingFace por Gemini

export async function analyzeLyrics(lyrics: string): Promise<{
  songTitle?: string;
  artist?: string;
  references: Array<{ title: string; description: string; icon: string; }>;
  curiosities: Array<{ title: string; description: string; icon: string; }>;
  authorIntention: string;
}> {
  try {
    const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
    if (!GOOGLE_API_KEY) throw new Error("GOOGLE_API_KEY não definida no ambiente");

    const endpoint = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${GOOGLE_API_KEY}`;
    const prompt = `Analise a letra da música abaixo e responda de forma clara, sem asteriscos, tópicos ou markdown. 
Resuma cada item em até 2 frases curtas e objetivas. 
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
      const regex = new RegExp(`${label}:\\s*([^\\n]*)\\s*([\\u2600-\\u27BF\\u1F300-\\u1F6FF\\u1F900-\\u1F9FF\\u1FA70-\\u1FAFF])?`, "iu");
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
  } catch (error) {
    console.error("Error analyzing lyrics:", error);
    return {
      references: [
        {
          title: "Análise Disponível",
          description: "A análise completa está temporariamente indisponível. A letra apresenta elementos poéticos dignos de estudo mais aprofundado.",
          icon: "fas fa-info"
        }
      ],
      curiosities: [
        {
          title: "Análise Pendente",
          description: "Uma análise mais detalhada será fornecida assim que o serviço estiver totalmente disponível.",
          icon: "fas fa-clock"
        }
      ],
      authorIntention: "A análise da intenção do autor requer processamento adicional. Por favor, tente novamente em alguns momentos."
    };
  }
}

function extractSongInfo(lyrics: string, type: 'title' | 'artist'): string | undefined {
  // Simple extraction logic - in a real implementation, this would be more sophisticated
  const lines = lyrics.split('\n');
  const firstLine = lines[0]?.trim();
  
  if (type === 'title' && firstLine && firstLine.length < 100) {
    return firstLine;
  }
  
  return undefined;
}
