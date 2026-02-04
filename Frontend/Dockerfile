# Build stage
FROM node:20-alpine AS build
WORKDIR /app

# Copier les fichiers de dépendances
COPY package.json ./
RUN npm install

# Copier le code source
COPY . .

# Build de l'application
ENV NEXT_PUBLIC_USE_MOCK=false
ENV NEXT_PUBLIC_API_URL=http://localhost:8080
RUN npm run build

# Run stage
FROM node:20-alpine
WORKDIR /app

COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public

EXPOSE 3000

ENV NODE_ENV=production
CMD ["node", "server.js"]
