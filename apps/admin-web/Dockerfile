# Multi-stage Dockerfile for @restovyn/admin-web
FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS builder
RUN apk update && apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml turbo.json ./
COPY packages/ ./packages/
COPY apps/admin-web/ ./apps/admin-web/

RUN pnpm install --frozen-lockfile || pnpm install
RUN pnpm --filter @restovyn/types build
RUN pnpm --filter @restovyn/validation build
RUN pnpm --filter @restovyn/business-rules build
RUN pnpm --filter @restovyn/admin-web build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

COPY --from=builder /app /app

EXPOSE 3000
CMD ["pnpm", "--filter", "@restovyn/admin-web", "start"]
