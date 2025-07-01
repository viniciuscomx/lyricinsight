# Build de produção simples: só backend + build do frontend
FROM node:18 AS build
WORKDIR /app

# Copia dependências e instala
COPY package.json .
COPY package-lock.json .
RUN npm install --legacy-peer-deps

# Copia todo o código
COPY . .

# Build do frontend e backend
RUN npm run build

# Imagem final para produção
FROM node:18-slim
WORKDIR /app

COPY --from=build /app ./
RUN npm install --omit=dev --legacy-peer-deps

EXPOSE 5000
# Ajuste para rodar o arquivo compilado do backend:
CMD ["node", "dist/index.js"]
