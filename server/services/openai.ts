// Using Hugging Face Inference API for text generation

// Adiciona fetch para Node.js se necessário
// Remova/comment se já estiver disponível globalmente (Node 18+)
// // npm install node-fetch

const HF_API_KEY = process.env.HF_API_KEY;
const HF_API_URL = "https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium";

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

async function callHuggingFaceAPI(prompt: string): Promise<string> {
  if (!HF_API_KEY) {
    throw new Error("Hugging Face API key not set in environment variable HF_API_KEY");
  }
  const response = await fetch(HF_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${HF_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      inputs: prompt,
      parameters: {
        max_length: 500,
        temperature: 0.7,
        return_full_text: false
      }
    })
  });

  if (!response.ok) {
    throw new Error(`Hugging Face API error: ${response.status}`);
  }

  const result = await response.json();
  return result[0]?.generated_text || '';
}

export async function analyzeLyrics(lyrics: string): Promise<AnalysisResult> {
  try {
    console.log("Analyzing lyrics with Hugging Face API...");
    
    // Create a structured prompt for analysis
    const analysisPrompt = `Analise esta letra de música em português brasileiro e identifique:
1. Referências culturais, históricas ou literárias
2. Curiosidades sobre a composição
3. Intenção do autor

Letra: "${lyrics.substring(0, 300)}"

Análise:`;

    // Call Hugging Face API
    const apiResponse = await callHuggingFaceAPI(analysisPrompt);
    
    // Since HuggingFace free models may not return structured JSON,
    // we'll parse the response and create our structured format
    const analysis: AnalysisResult = {
      songTitle: extractSongInfo(lyrics, 'title'),
      artist: extractSongInfo(lyrics, 'artist'),
      references: [
        {
          title: "Análise Textual",
          description: apiResponse.substring(0, 200) + "...",
          icon: "fas fa-book"
        },
        {
          title: "Contexto Cultural",
          description: "A letra reflete elementos culturais e sociais do contexto em que foi criada.",
          icon: "fas fa-globe"
        },
        {
          title: "Estilo Literário",
          description: "A composição demonstra técnicas poéticas e narrativas específicas do gênero.",
          icon: "fas fa-feather"
        }
      ],
      curiosities: [
        {
          title: "Estrutura Poética",
          description: "A música utiliza recursos como metáfora, rima e ritmo para criar impacto emocional.",
          icon: "fas fa-pen"
        },
        {
          title: "Temática Central",
          description: "Os temas abordados refletem experiências humanas universais e contemporâneas.",
          icon: "fas fa-heart"
        },
        {
          title: "Impacto Sonoro",
          description: "A escolha das palavras considera tanto o significado quanto o efeito sonoro na música.",
          icon: "fas fa-music"
        }
      ],
      authorIntention: apiResponse || "A análise sugere que o autor busca conectar-se emocionalmente com o público através de uma narrativa pessoal que ecoa experiências universais. A letra demonstra cuidado na construção de imagens poéticas e na escolha de palavras que evocam sentimentos específicos."
    };

    return analysis;
  } catch (error) {
    console.error("Error analyzing lyrics:", error);
    
    // Fallback analysis if API fails
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
