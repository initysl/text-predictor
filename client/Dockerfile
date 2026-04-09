# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

ARG VITE_API_URL=http://localhost:8000
ENV VITE_API_URL=$VITE_API_URL

COPY package*.json ./
RUN npm ci --no-audit --no-fund

COPY . .

# Build with production optimizations
RUN npm run build

# Production stage
FROM nginx:alpine

ENV PORT=80
ENV API_UPSTREAM=http://backend:8000

# Copy runtime nginx template
COPY nginx.conf /etc/nginx/templates/default.conf.template

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
