FROM node:22-alpine AS builder
WORKDIR /app

# الحل هنا بالظبط ← اضبط NODE_ENV على development في الـ build فقط
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

# ====== Production Stage ======
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
...