# ---- Base deps ----

FROM docker.io/library/node:22-alpine AS deps
WORKDIR /usr/src/app

# Install deps
COPY package*.json ./
RUN npm ci

# ---- Build stage ----
FROM docker.io/library/node:22-alpine AS build
WORKDIR /usr/src/app

COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY . .

RUN npm run build

# ---- Production runtime ----
FROM docker.io/library/node:22-alpine AS production
WORKDIR /usr/src/app

ENV NODE_ENV=production

# Install only prod deps
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy built artifacts
COPY --from=build /usr/src/app/dist ./dist

# Copy the entrypoint script into the image
COPY docker-entrypoint.sh /usr/local/bin/

# Make the script executable
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Set the entrypoint
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]

USER node
CMD ["node", "dist/main"]
