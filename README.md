# LyricInsight

LyricInsight é uma aplicação web para análise inteligente de letras musicais, utilizando IA (Gemini, HuggingFace, OpenAI, DeepSeek) para identificar referências culturais, curiosidades e intenções do autor.

<p align="center">
  <img src=""C:\Users\vinicius.xavier\Downloads\WhatsApp Image 2025-07-01 at 13.26.59.jpeg"" alt="LyricInsight Banner" width="80%" />
</p>

---

## Como funciona o projeto?

### Visão Geral

- **Frontend:** Interface web moderna feita em React + Vite.
- **Backend:** API Node.js/Express em TypeScript.
- **IA:** Integração com Gemini API (Google) para análise textual avançada.
- **Banco:** (Opcional) Armazena histórico de análises e permite consultar análises recentes.

---

## Fluxo do Usuário

1. **Acesse a página principal**
   - Você verá um campo para colar a letra da música.
   - Exemplo:
     <p align="center">
       <img src="https://raw.githubusercontent.com/seu-usuario/lyricinsight/main/.github/lyricinsight-analyze.png" alt="Tela de análise" width="80%" />
     </p>

2. **Cole a letra da música**
   - O botão "Analisar Letra" ficará habilitado quando houver pelo menos 50 caracteres.

3. **Clique em "Analisar Letra"**
   - O frontend envia a letra para o backend via `/api/analyze`.
   - O backend chama a API Gemini, processa a resposta e retorna um objeto segmentado:
     - Referências culturais/históricas/literárias
     - Curiosidades sobre a composição
     - Intenção do autor

4. **Veja a análise segmentada**
   - O resultado aparece em três abas/cartões:
     - **Referências:** Mostra influências, citações ou contextos históricos/literários.
     - **Curiosidades:** Fatos interessantes ou detalhes sobre a composição.
     - **Intenção do autor:** Interpretação do significado e mensagem da música.
   - Cada bloco pode trazer um emoji relacionado ao conteúdo.
   - Exemplo:
     <p align="center">
       <img src="https://raw.githubusercontent.com/seu-usuario/lyricinsight/main/.github/lyricinsight-demo.gif" alt="Demonstração LyricInsight" width="80%" />
     </p>

5. **Ações adicionais**
   - Compartilhe a análise.
   - Inicie uma nova análise.
   - Consulte o histórico de análises recentes.

---

## Como funciona o backend?

- **Rota principal:** `POST /api/analyze`
  - Recebe `{ lyrics, songTitle?, artist? }`
  - Valida o tamanho da letra.
  - Chama a função `analyzeLyrics`, que:
    - Monta um prompt detalhado para a Gemini API.
    - Faz a requisição e recebe a resposta segmentada.
    - Extrai e organiza cada parte da análise (referências, curiosidades, intenção).
  - Retorna um JSON já pronto para o frontend exibir.

- **Outras rotas:**
  - `GET /api/analysis/:id` — Busca análise por ID.
  - `GET /api/recent` — Lista análises recentes.

---

## Como funciona o frontend?

- **Página principal:**  
  - Campo de texto para colar a letra.
  - Botão para analisar (desabilitado se a letra for curta).
  - Mostra loading enquanto a IA responde.
  - Exibe a análise segmentada em cartões/abas.
  - Botões para compartilhar ou iniciar nova análise.
- **Histórico:**  
  - Mostra análises recentes (opcional).
- **Responsivo:**  
  - Funciona bem em desktop e mobile.

---

## Tecnologias Utilizadas

- **Frontend:** React, Vite, Wouter, TailwindCSS (opcional)
- **Backend:** Node.js, Express, TypeScript
- **IA:** Gemini API (Google), HuggingFace Inference API, OpenAI, DeepSeek (opcional)
- **Outros:** Drizzle ORM, Zod, TanStack Query

---

## Instalação

1. **Clone o repositório:**
   ```sh
   git clone https://github.com/seu-usuario/lyricinsight.git
   cd lyricinsight
   ```

2. **Instale as dependências:**
   ```sh
   npm install
   ```

3. **Crie um arquivo `.env` na raiz do projeto:**
   ```
   # Exemplo de .env
   GOOGLE_API_KEY=sua_chave_gemini
   #HUGGINGFACE_API_KEY=seu_token_huggingface
   #OPENAI_API_KEY=sk-...
   #DEEPSEEK_API_KEY=sk-...
   ```

4. **(Opcional) Adapte o modelo Gemini ou HuggingFace em `server/index.ts` para outro modelo público, se desejar.**

---

## Como rodar em desenvolvimento

```sh
npm run dev
```
- O backend sobe em `http://localhost:5000`
- O frontend é servido pelo Vite via backend.

---

## Como rodar em produção

1. Gere o build do frontend:
   ```sh
   npm run build
   ```
2. Inicie o servidor:
   ```sh
   npm start
   ```

---

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

---

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
