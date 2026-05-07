FROM node:22-alpine AS builder
WORKDIR /app

COPY package*.json ./
COPY client/package*.json ./client/
COPY server/package*.json ./server/

RUN npm install --legacy-peer-deps

COPY . .

RUN cd server && ./node_modules/.bin/prisma generate

RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/client/dist ./client/dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/server/prisma ./server/prisma
COPY --from=builder /app/package.json ./package.json

COPY --from=builder /app/server/generated ./server/generated

RUN mkdir -p node_modules/@generated && \
    ln -sf /app/server/generated /app/node_modules/@generated

EXPOSE 3000

CMD ["sh", "-c", "cd server && npx prisma migrate deploy && cd /app && node server/dist/main.js"]