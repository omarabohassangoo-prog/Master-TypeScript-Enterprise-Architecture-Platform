# Multi-stage Dockerfile for Master TypeScript Enterprise Platform

# Stage 1: Build & Bundling Stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package descriptors
COPY package*.json ./

# Install dependencies
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# Copy source code
COPY . .

# Build Vite frontend & Bundle Express backend into dist/server.cjs
RUN npm run build

# Stage 2: Production Execution Stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy descriptors and production node_modules
COPY package*.json ./
RUN if [ -f package-lock.json ]; then npm ci --only=production; else npm install --only=production; fi

# Copy built production artifacts from builder stage
COPY --from=builder /app/dist ./dist

# Expose required container ingress port
EXPOSE 3000

# Health check endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/v1/system/metrics || exit 1

# Start bundled CommonJS production server
CMD ["node", "dist/server.cjs"]
