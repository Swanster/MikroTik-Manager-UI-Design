# Stage 1: Build
FROM node:22-alpine AS builder
WORKDIR /app

# Copy dependency manifests
COPY package.json package-lock.json ./

# Install dependencies (ci = clean install from lockfile)
RUN npm ci

# Copy source code
COPY . .

# Build production bundle
RUN npm run build

# Stage 2: Serve
FROM nginx:stable-alpine AS runner

# Copy nginx config
COPY <<'EOF' /etc/nginx/conf.d/default.conf
server {
    listen       80;
    server_name  localhost;
    root         /usr/share/nginx/html;
    index        index.html;

    # Gzip
    gzip on;
    gzip_types text/css application/javascript text/html;

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# Copy build output from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
