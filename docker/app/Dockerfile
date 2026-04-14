FROM node:20-bookworm-slim

WORKDIR /workspace

COPY package*.json ./
COPY apps/angularApi/package*.json ./apps/angularApi/

RUN npm ci && npm ci --prefix apps/angularApi --legacy-peer-deps

COPY . .

RUN chmod +x docker/app/start.sh

EXPOSE 3000 4200

CMD ["bash", "docker/app/start.sh"]
