# VisionOps Server Dockerfile
FROM node:18-alpine

WORKDIR /usr/src/app

# Install production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy application source
COPY . .

# Set environment defaults
ENV PORT=5000
ENV NODE_ENV=production

EXPOSE 5000

CMD ["node", "src/server.js"]
