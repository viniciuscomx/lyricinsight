# LyricInsight

LyricInsight é uma aplicação web para análise inteligente de letras musicais, utilizando modelos de IA (Gemini, HuggingFace, OpenAI, DeepSeek) para identificar referências culturais, curiosidades e intenções do autor.

<p align="center">
  <img src="https://raw.githubusercontent.com/seu-usuario/lyricinsight/main/.github/lyricinsight-banner.png" alt="LyricInsight Banner" width="80%" />
</p>

## Funcionalidades

- Análise automática de letras musicais usando IA.
- Identificação de referências culturais, históricas e literárias.
- Descoberta de curiosidades sobre a composição.
- Sugestão da intenção do autor.
- Histórico de análises recentes.
- Interface web moderna com React + Vite.

<p align="center">
  <img src="https://raw.githubusercontent.com/seu-usuario/lyricinsight/main/.github/lyricinsight-demo.gif" alt="Demonstração LyricInsight" width="80%" />
</p>

## Tecnologias Utilizadas

- **Frontend:** React, Vite, Wouter, TailwindCSS (opcional)
- **Backend:** Node.js, Express, TypeScript
- **IA:** Gemini API (Google), HuggingFace Inference API, OpenAI, DeepSeek (opcional)
- **Outros:** Drizzle ORM, Zod, TanStack Query

## Pré-requisitos

- Node.js 18+
- npm ou yarn
- Conta na [Google AI Gemini](https://ai.google.dev/) (para obter o token da API)
- (Opcional) Conta na [HuggingFace](https://huggingface.co/), [OpenAI](https://platform.openai.com/) ou [DeepSeek](https://deepseek.com/)

## Instalação

1. Clone o repositório:
   ```sh
   git clone https://github.com/seu-usuario/lyricinsight.git
   cd lyricinsight
   ```

2. Instale as dependências:
   ```sh
   npm install
   ```

3. Crie um arquivo `.env` na raiz do projeto:
   ```
   # Exemplo de .env
   GOOGLE_API_KEY=sua_chave_gemini
   #HUGGINGFACE_API_KEY=seu_token_huggingface
   #OPENAI_API_KEY=sk-...
   #DEEPSEEK_API_KEY=sk-...
   ```

4. (Opcional) Adapte o modelo Gemini ou HuggingFace em `server/index.ts` para outro modelo público, se desejar.

## Como rodar em desenvolvimento

```sh
npm run dev
```
- O backend sobe em `http://localhost:5000`
- O frontend é servido pelo Vite via backend.

<p align="center">
  <img src="https://raw.githubusercontent.com/seu-usuario/lyricinsight/main/.github/lyricinsight-analyze.png" alt="Tela de análise" width="80%" />
</p>

## Como rodar em produção

1. Gere o build do frontend:
   ```sh
   npm run build
   ```
2. Inicie o servidor:
   ```sh
   npm start
   ```

## Estrutura do Projeto

```
LyricInsight/
├── client/           # Frontend React
│   └── src/
├── server/           # Backend Express/TypeScript
├── shared/           # Schemas e tipos compartilhados
├── .env.example      # Exemplo de variáveis de ambiente
├── .gitignore
├── package.json
└── README.md
```

## Segurança

- **NUNCA** suba seu arquivo `.env` ou chaves de API para o GitHub.
- O `.env` já está no `.gitignore` por padrão.

## Troca de modelo IA

Para usar outro modelo HuggingFace, altere o endpoint em `server/routes.ts`:
```typescript
const endpoint = "https://api-inference.huggingface.co/models/facebook/opt-1.3b";
```
Verifique sempre se o modelo tem o selo "Hosted inference API".

## Deploy

Você pode fazer deploy em qualquer serviço Node.js (Vercel, Render, Heroku, etc).  
Garanta que as variáveis de ambiente estejam configuradas no painel do serviço.

## Licença

MIT

---

**Dúvidas ou sugestões?**  
Abra uma issue ou envie um pull request!
