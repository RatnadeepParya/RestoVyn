# RestoVyn — Enterprise Restaurant POS & Management Platform

[![CI Pipeline](https://github.com/RatnadeepParya/RestoVyn/actions/workflows/ci.yml/badge.svg)](https://github.com/RatnadeepParya/RestoVyn/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

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

---

## 7. Enterprise Infrastructure Suite

RestoVyn provides an enterprise-grade, multi-topology infrastructure suite designed for high availability in the cloud and autonomous resilience on local restaurant hardware.

### Production Multi-Container Topology (`docker-compose.prod.yml`)

- **PgBouncer Connection Pooling**: Transaction-level pooling scaling up to 1,000+ concurrent POS and Captain tablet connections.
- **Hardened PostgreSQL 16**: Tuned for high-transaction SSD operations (`shared_buffers=512MB`, `work_mem=16MB`, autovacuum optimizations).
- **Redis 7 Enterprise**: AOF append-only persistence with `volatile-lru` eviction policy.
- **NGINX High-Performance Gateway**: HTTP/2, TLS 1.3, rate-limiting zones (API & brute-force PIN protection), WebSocket (`/socket.io/`) proxying, Brotli/Gzip.
- **Multi-Stage Dockerfiles**: Unprivileged `node` user with `dumb-init` signal handling and built-in healthchecks (`Dockerfile.prod`).

```bash
# Launch full production stack with PgBouncer, Redis, API, Web & NGINX
docker compose -f docker-compose.prod.yml up -d
```

### Kubernetes & Helm (`infrastructure/k8s` & `infrastructure/helm`)

- **Cloud-Native Kubernetes**: StatefulSets, Deployments, Horizontal Pod Autoscaler (HPA), Pod Disruption Budgets (PDB), and Zero-Trust NetworkPolicies.
- **Turnkey Helm Chart**: Production chart installable on EKS, GKE, AKS, or local K3s/Rancher clusters:
  ```bash
  helm install restovyn ./infrastructure/helm/restovyn -n restovyn-system --create-namespace
  ```

### Full-Stack Observability (`infrastructure/monitoring`)

- **Prometheus & Alertmanager**: Pre-configured scrape jobs and critical alert rules for P99 latency breaches, elevated 5xx error rates, PgBouncer pool saturation, and disk capacity.
- **Grafana Dashboard**: Turnkey real-time POS dashboard monitoring throughput (RPS), active tables, KOT dispatch rate, and DB pool stats:
  ```bash
  docker compose -f infrastructure/monitoring/docker-compose.monitoring.yml up -d
  ```

### Multi-Cloud Infrastructure as Code (`infrastructure/terraform`)

- **AWS**: Multi-AZ VPC, ECS Fargate, RDS PostgreSQL Multi-AZ, ElastiCache Redis, S3 bucket with Glacier lifecycle, AWS WAF v2.
- **GCP**: Regional VPC, Cloud SQL PostgreSQL HA, Memorystore Redis, Cloud Storage, Cloud Armor.
- **Azure**: VNet, Azure Container Apps, PostgreSQL Flexible Server HA, Azure Cache for Redis, Azure Blob Storage.

### On-Premise Restaurant Edge Appliance & Automated Backups

- **Autonomous Edge Appliance (`infrastructure/edge/edge-setup.sh`)**: Transforms an on-premise Intel NUC or Mini PC into a 24/7 restaurant server with mDNS LAN resolution (`http://restovyn.local`) and static thermal printer routing (port 9100).
- **Automated Database Backup Daemon (`scripts/backup-db.sh`)**: Nightly compressed `pg_dump` with SHA256 verification, GPG symmetric encryption, 30-day retention pruning, and offsite sync to AWS S3 or GCP GCS.
- **Disaster Recovery Runbook (`docs/disaster-recovery.md`)**: Validated restoration (`scripts/restore-db.sh`) with RTO < 15 minutes and RPO < 5 minutes.
