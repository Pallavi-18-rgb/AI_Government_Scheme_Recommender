# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code and build
COPY . .
# We don't define VITE_API_BASE_URL here if it's injected at runtime, 
# but Vite embeds env vars at build time. For a true runtime config, 
# you'd need an entrypoint script to replace it, or just build it for each environment.
# Since we have it in the code as `import.meta.env.VITE_API_BASE_URL || '/api'`,
# we can just let it fallback to '/api' and use NGINX reverse proxy.
RUN npm run build

# Serve stage
FROM nginx:alpine

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom NGINX config to handle client-side routing and API proxying
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
