import fetch from "node-fetch";

// Função para extrair e resumir pontos importantes da análise do Gemini
function parseGeminiAnalysis(text: string) {
  // Extrai blocos principais usando regex simples
  const refMatch = text.match(/\*\*1\. Refer[^\*]*\*\*:?([\s\S]*?)(\*\*|$)/i);
  const curMatch = text.match(/\*\*2\. Curiosidades[^\*]*\*\*:?([\s\S]*?)(\*\*|$)/i);
  const intMatch = text.match(/\*\*3\. Inten[^\*]*\*\*:?([\s\S]*)/i);

  // Limita cada campo a 2 frases curtas, remove excesso de espaços e pontuação
  function summarize(str?: string) {
    if (!str) return "";
    // Pega só as duas primeiras frases
    const sentences = str.replace(/\n/g, " ").split(/(?<=[.!?])\s+/).filter(Boolean);
    return sentences.slice(0, 2).join(" ").trim();
  }

  return {
    references: summarize(refMatch ? refMatch[1] : ""),
    curiosities: summarize(curMatch ? curMatch[1] : ""),
    intention: summarize(intMatch ? intMatch[1] : ""),
  };
}

export async function analyzeLyrics(lyrics: string): Promise<{
  references: { title: string; description: string; icon: string }[];
  curiosities: { title: string; description: string; icon: string }[];
  authorIntention: string;
}> {
  const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
  if (!GOOGLE_API_KEY) throw new Error("GOOGLE_API_KEY não definida no ambiente");

  const endpoint = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${GOOGLE_API_KEY}`;
  const prompt = `Analise a letra da música abaixo e retorne de forma resumida, criativa e visualmente agradável:
- Use frases curtas e objetivas.
- Destaque apenas os pontos realmente relevantes.
- Para cada item, use no máximo 2 frases.
- Se não houver curiosidades ou referências, diga "Nenhuma encontrada".

Letra: """${lyrics.substring(0, 1000)}"""

Análise:
1. **Referências culturais, históricas ou literárias:** 
2. **Curiosidades sobre a composição:** 
3. **Intenção do autor:** 
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
  const text = result?.candidates?.[0]?.content?.parts?.[0]?.text || "Análise não disponível.";

  // Extrai e resume os pontos importantes
  const parsed = parseGeminiAnalysis(text);

  return {
    references: [
      {
        title: "Referências",
        description: parsed.references || "Nenhuma encontrada.",
        icon: "🔗"
      }
    ],
    curiosities: parsed.curiosities
      ? [
          {
            title: "Curiosidades",
            description: parsed.curiosities,
            icon: "💡"
          }
        ]
      : [
          {
            title: "Curiosidades",
            description: "Nenhuma encontrada.",
            icon: "💡"
          }
        ],
    authorIntention: parsed.intention || "Nenhuma intenção identificada."
  };
}
