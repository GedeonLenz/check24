#Dockerfile
FROM node:18-alpine AS check24messenger
LABEL Developers="Gedeon Lenz"
WORKDIR /app
COPY . .
RUN npm ci
RUN npm run build
RUN rm -rf src/ docker-compose.yml
USER node:node
CMD ["node","build/index.js"]