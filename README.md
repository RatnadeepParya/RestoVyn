# RestoVyn — Enterprise Restaurant POS & Management Platform

[![CI Pipeline](https://github.com/RatnadeepParya/RestoVyn/actions/workflows/ci.yml/badge.svg)](https://github.com/RatnadeepParya/RestoVyn/actions/workflows/ci.yml)
[![License: UNLICENSED](https://img.shields.io/badge/License-UNLICENSED-red.svg)](LICENSE)

RestoVyn is a production-grade, internal restaurant operations and Point of Sale (POS) operating platform designed for a single restaurant with future multi-branch scalability.

> [!IMPORTANT]
> **Internal Operations Only**: RestoVyn is strictly built for internal staff (Owners, Managers, Cashiers, Waiters/Captains, Kitchen Chefs, Inventory Personnel, and Accountants). There are **no customer-facing applications**, no customer registration, and no self-service order portals.

---

## 1. Applications Suite

```text
                        RESTAURANT SYSTEM
                                │
               ┌────────────────┼────────────────┐
               │                │                │
          Desktop POS      Admin Web        Captain App
        (Electron/React)  (Next.js App)      (Flutter)
               │                │                │
               └────────────────┼────────────────┘
                                │
                          Backend API
                           (NestJS)
                                │
                       PostgreSQL + Redis
```

| Application                                    | Technology                                                       | Target Users                                       | Key Responsibilities                                                                                 |
| ---------------------------------------------- | ---------------------------------------------------------------- | -------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| **Desktop POS** (`apps/pos-desktop`)           | Electron, React, TypeScript, Vite, Tailwind CSS, Local SQLite    | Cashier, POS Operator, Manager                     | Fast touch order entry, billing, split tenders, cash drawer, thermal receipts, **offline operation** |
| **Admin Web Panel** (`apps/admin-web`)         | Next.js 14/15, React, TypeScript, Tailwind CSS                   | Owner, General Manager, Accountant, Inventory Lead | Complete configuration, menu, inventory recipes, staff RBAC, finance, reports, KDS                   |
| **Captain Mobile App** (`apps/captain-mobile`) | Flutter 3.x, Dart                                                | Waiters, Captains                                  | Floor layout, table status, quick order creation, add-ons, KOT dispatch, bill requests               |
| **Backend API** (`services/api`)               | NestJS 10, TypeScript, Prisma ORM, PostgreSQL, Redis, WebSockets | Central Services                                   | Business logic, state machines, integer minor unit billing, KOT routing, sync queue, audit           |

---

## 2. Key Architecture & Business Rules

1. **No Floating-Point Money**: All financial quantities (prices, taxes, discounts, tender amounts, grand totals) are strictly calculated and stored in **integer minor units** (e.g. ₹250.50 is stored as `25050` paise).
2. **Infrastructure Independence**: Core business logic is decoupled from cloud providers. Storage, payments, notifications, and printers use pluggable interfaces (`StorageProvider`, `PaymentProvider`, `NotificationProvider`, `PrinterProvider`).
3. **Offline-Capable Desktop POS**: When internet fails, the Desktop POS stores orders and cash transactions in local SQLite, syncing automatically via idempotency keys (`syncId`) upon reconnection.
4. **Optimistic Concurrency**: Orders and tables maintain a `version` counter to prevent overwrite conflicts when multiple staff members (captain, cashier, manager) access the same ticket.

---

## 3. Repository Governance & PR Approval Rules

Per project specifications:

- Merges to the `master` branch are strictly gated through Pull Requests.
- **Pull Requests for `master` MUST ONLY be approved by repository owner @RatnadeepParya**.
- Branch protection requires green CI checks (`lint`, `typecheck`, `test`, `build`) and CODEOWNERS sign-off before merging.

---

## 4. Quick Start Guide

### Prerequisites

- Node.js v20+
- pnpm v9+
- Docker & Docker Compose (for PostgreSQL and Redis)

### Running Locally with Docker

```bash
# 1. Start local PostgreSQL and Redis
docker compose -f docker-compose.dev.yml up -d

# 2. Install monorepo dependencies
pnpm install

# 3. Generate Prisma client and run seed
pnpm db:generate
pnpm db:seed

# 4. Start all applications in development mode
pnpm dev
```

### URLs

- **Backend API**: `http://localhost:4000/api/v1`
- **Swagger Docs**: `http://localhost:4000/api/docs`
- **Admin Web**: `http://localhost:3000`
- **Desktop POS**: `http://localhost:5173` (or via Electron)
- **Health Check**: `http://localhost:4000/health`

---

## 5. Seed Staff Credentials (Development)

| Role             | Username        | Default Password | Quick POS PIN |
| ---------------- | --------------- | ---------------- | ------------- |
| **Owner**        | `ratnadeep`     | `Admin@12345`    | `1234`        |
| **Manager**      | `amit_manager`  | `Admin@12345`    | `1234`        |
| **Cashier**      | `priya_cashier` | `Admin@12345`    | `1234`        |
| **Captain**      | `rahul_captain` | `Admin@12345`    | `1234`        |
| **Kitchen Chef** | `sanjay_chef`   | `Admin@12345`    | `1234`        |

---

## 6. Monorepo Scripts

```bash
pnpm lint        # Run linter across all apps & packages
pnpm typecheck   # Type-check TypeScript in all workspaces
pnpm test        # Run unit tests (billing, split-bill, cash formulas)
pnpm build       # Turbo build all packages and applications
```
