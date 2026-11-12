# Stage 1: Base & Dependencies
FROM node:20-alpine AS base
WORKDIR /app
COPY . .
RUN if [ -f "package.json" ]; then npm install; fi

# Stage 2: Development (Digunakan oleh docker-compose untuk local dev)
FROM base AS development
EXPOSE 3000
CMD ["sh", "-c", "if [ -f package.json ]; then npm run dev -- --host 0.0.0.0 --port 3000; else echo '[frontend] Menunggu inisialisasi project React di folder ./frontend...'; sleep infinity; fi"]

# Stage 3: Builder untuk production build
FROM base AS builder
RUN if [ -f "package.json" ]; then npm run build; else mkdir -p dist && echo '<h1>UMKM Financial Health Frontend</h1>' > dist/index.html; fi

# Stage 4: Production Web Server (Menggunakan base image lokal nginx:1.28-alpine yang sudah ada di Docker)
FROM nginx:1.28-alpine AS production
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
