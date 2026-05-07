FROM node:24-alpine AS deps

WORKDIR /app

COPY package.json package-lock.json ./
COPY client ./client

RUN npm ci

FROM node:24-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY client .

ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN npm run build

FROM node:24-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json

EXPOSE 4173

CMD ["npx", "vite", "preview", "--host", "0.0.0.0", "--port", "4173"]
