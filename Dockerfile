# syntax=docker/dockerfile:1
ARG NODE_VERSION=20-alpine

FROM node:${NODE_VERSION} AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:${NODE_VERSION} AS build
WORKDIR /app
# NEXT_PUBLIC_* is inlined into the client bundle at build time.
ARG NEXT_PUBLIC_API_URL=http://localhost:3000
ARG NEXT_PUBLIC_APP_NAME="Artisan SaaS"
ARG APP_RELEASE=dev
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL} \
    NEXT_PUBLIC_APP_NAME=${NEXT_PUBLIC_APP_NAME} \
    APP_RELEASE=${APP_RELEASE} \
    NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:${NODE_VERSION} AS production
ARG APP_RELEASE=dev
WORKDIR /app
ENV NODE_ENV=production \
    PORT=3001 \
    HOSTNAME=0.0.0.0 \
    APP_RELEASE=${APP_RELEASE} \
    NEXT_TELEMETRY_DISABLED=1
RUN apk add --no-cache curl
COPY --from=build --chown=node:node /app/public ./public
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static
USER node
EXPOSE 3001
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD curl -fsS http://localhost:3001/api/health || exit 1
CMD ["node", "server.js"]
