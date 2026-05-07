FROM node:22-alpine AS builder
WORKDIR /app

ENV NODE_ENV=development

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY server/package*.json ./server/
RUN cd server && npm install --legacy-peer-deps

COPY client/package*.json ./client/
RUN cd client && npm install --legacy-peer-deps

COPY . .

RUN cd server && npx prisma generate

RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/client/dist ./client/dist
COPY --from=builder /app/server/node_modules ./server/node_modules
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/server/prisma ./server/prisma
COPY --from=builder /app/package*.json ./

EXPOSE 3000
CMD ["node", "server/dist/index.js"]