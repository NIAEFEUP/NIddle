FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat python3 make g++ gcc build-base
WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/api/package.json ./apps/api/package.json

RUN npm ci -w apps/api

FROM node:22-alpine AS builder
WORKDIR /app

COPY --from=deps /app /app

COPY apps/api ./apps/api

RUN npm run build -w apps/api

RUN npm prune --omit=dev -w apps/api

FROM deps AS api-dev

EXPOSE 3001
CMD ["npm", "run", "start:dev", "-w", "apps/api"]

FROM node:22-alpine AS api-runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json

COPY /apps/api/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh && chown -R node:node /app
USER node

EXPOSE 3001
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["node", "apps/api/dist/main.js"]