FROM node:20-alpine

# Install build dependencies for native modules (bcrypt) and curl for healthcheck
RUN apk add --no-cache python3 make g++ curl

WORKDIR /app

# Install dependencies (including dev dependencies for building)
COPY package*.json ./
RUN npm ci

# Copy Prisma schema and config and generate client
COPY prisma ./prisma/
COPY prisma.config.ts ./
RUN npx prisma generate

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Remove dev dependencies to reduce image size
RUN npm prune --production

# Create uploads directory
RUN mkdir -p /app/uploads/proofs

# Expose port
EXPOSE 3000

# Start the server with DB sync
CMD npx prisma db push && npm start
