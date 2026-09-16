# Local Development Guide

## 1. Requirements

- Node.js >= 20.x
- pnpm >= 9.x
- Docker & Docker Compose (recommended for PostgreSQL and Redis)

---

## 2. Setup Instructions

```bash
# Clone the repository
git clone https://github.com/RatnadeepParya/RestoVyn.git
cd RestoVyn

# 1. Start development database and cache
docker compose -f docker-compose.dev.yml up -d

# 2. Install workspace dependencies
pnpm install

# 3. Generate Prisma client & seed database
pnpm db:generate
pnpm db:seed

# 4. Start all applications concurrently
pnpm dev
```

---

## 3. Endpoints & Ports

- **Backend API**: `http://localhost:4000/api/v1`
- **Swagger API Documentation**: `http://localhost:4000/api/docs`
- **Admin Web Panel**: `http://localhost:3000`
- **Desktop POS (Vite Web View)**: `http://localhost:5173`
- **Health Endpoint**: `http://localhost:4000/health`

---

## 4. Quality Commands

```bash
pnpm lint        # Run ESLint across all apps & packages
pnpm typecheck   # Typecheck TypeScript codebase
pnpm test        # Run Jest unit test suite
pnpm build       # Production Turbo build
```
