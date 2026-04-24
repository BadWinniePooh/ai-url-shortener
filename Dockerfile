# Stage 1 — Build frontend
FROM node:20-alpine AS frontend-builder
ARG VITE_BASE_URL=http://localhost:3001
ENV VITE_BASE_URL=$VITE_BASE_URL
WORKDIR /app/frontend
COPY frontend/package.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2 — Backend + embedded frontend
FROM node:20-alpine AS app
WORKDIR /app
COPY backend/package.json ./
RUN npm install --production
COPY backend/ ./
COPY --from=frontend-builder /app/frontend/dist ./public

ENV NODE_ENV=production
EXPOSE 3001

CMD ["node", "src/index.js"]
