FROM node:20-alpine AS build

WORKDIR /app/backend

COPY backend/package*.json ./
COPY backend/tsconfig.json ./
RUN npm ci

COPY backend/src ./src
RUN npm run build

FROM node:20-alpine

WORKDIR /app/backend

COPY backend/package*.json ./
RUN npm ci --omit=dev

COPY --from=build /app/backend/dist ./dist
COPY frontend /app/frontend

EXPOSE 3000

CMD ["node", "dist/server.js"]
