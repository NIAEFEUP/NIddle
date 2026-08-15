FROM node:22-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/web/package.json ./apps/web/package.json

RUN npm ci -w apps/web

FROM deps AS web-dev

EXPOSE 3000
CMD ["npm", "run", "dev", "-w", "apps/web"]

FROM node:22-alpine AS builder
WORKDIR /app

COPY --from=deps /app /app

COPY apps/web ./apps/web

RUN npm run build -w apps/web

RUN npm prune --omit=dev -w apps/web

FROM node:22-alpine AS web-runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/web/package.json ./apps/web/package.json
COPY --from=builder /app/apps/web/dist ./apps/web/dist

USER node

EXPOSE 3000
CMD ["./node_modules/.bin/sirv", "apps/web/dist", "--host", "--port", "3000", "--single"]
