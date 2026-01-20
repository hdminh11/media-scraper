# Optimized backend Dockerfile

# Build stage: install production deps and generate Prisma client
FROM node:20-alpine AS builder
WORKDIR /app

# Install only production dependencies for smaller node_modules
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy only Prisma schema needed for client generation
COPY src/prisma/schema.prisma ./src/prisma/schema.prisma

# Provide DATABASE_URL for prisma generate (not persisted in final image)
ARG DATABASE_URL=postgresql://admin:admin@postgres:5432/media?schema=public
ENV DATABASE_URL=${DATABASE_URL}

# Generate Prisma client
RUN npx prisma generate --schema=./src/prisma/schema.prisma

# Runtime stage: minimal image with app code and production deps
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy production node_modules and application source
COPY --from=builder /app/node_modules ./node_modules
COPY . .

# Copy entrypoint script for migrations
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 3000
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["node", "server.js"]
