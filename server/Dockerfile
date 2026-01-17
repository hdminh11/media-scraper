# Backend Dockerfile
FROM node:20-alpine AS base
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install --production=false

# Copy source
COPY . .

# Ensure Prisma can find schema and env at build time
ARG DATABASE_URL=postgresql://admin:admin@postgres:5432/media?schema=public
ENV DATABASE_URL=${DATABASE_URL}

# Generate Prisma client with explicit schema path
RUN npx prisma generate --schema=./src/prisma/schema.prisma

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "server.js"]
