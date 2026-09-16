# Build Dockerfile for apps/pos-desktop web/kiosk build
FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml turbo.json ./
COPY packages/ ./packages/
COPY apps/pos-desktop/ ./apps/pos-desktop/

RUN pnpm install --frozen-lockfile || pnpm install
RUN pnpm --filter @restovyn/types build
RUN pnpm --filter @restovyn/validation build
RUN pnpm --filter @restovyn/business-rules build
RUN pnpm --filter @restovyn/pos-desktop build

FROM nginx:alpine AS runner
COPY --from=base /app/apps/pos-desktop/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
