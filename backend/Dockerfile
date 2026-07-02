FROM node:22-alpine

WORKDIR /app

# Install dependencies
ENV NODE_ENV=production
COPY package*.json ./
RUN npm install --production

# Copy application code
COPY . .

# Expose API port
EXPOSE 5000

# Run server
CMD ["node", "server.js"]
