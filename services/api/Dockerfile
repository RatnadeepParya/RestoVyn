# Multi-stage production Dockerfile for @restovyn/api
FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS builder
RUN apk update && apk add --no-cache libc6-compat openssl
WORKDIR /app

COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml turbo.json ./
COPY packages/ ./packages/
COPY prisma/ ./prisma/
COPY services/api/ ./services/api/

RUN pnpm install --frozen-lockfile || pnpm install
RUN pnpm --filter @restovyn/api db:generate
RUN pnpm --filter @restovyn/types build
RUN pnpm --filter @restovyn/validation build
RUN pnpm --filter @restovyn/business-rules build
RUN pnpm --filter @restovyn/api build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN apk update && apk add --no-cache openssl curl

COPY --from=builder /app /app

EXPOSE 4000
CMD ["node", "services/api/dist/main"]
