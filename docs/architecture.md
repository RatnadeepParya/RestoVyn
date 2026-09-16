# RestoVyn Technical Architecture

```mermaid
flowchart TD
    subgraph ClientApps["Client Applications"]
        POS["Desktop POS\n(Electron + React + SQLite)"]
        ADMIN["Admin Web Panel\n(Next.js App Router)"]
        CAPTAIN["Captain App\n(Flutter)"]
        KDS["Kitchen Display (KDS)\n(Touch Web View)"]
    end

    subgraph API["NestJS API Gateway & Core (/api/v1)"]
        AUTH["Auth & PIN Guard"]
        ORDERS["Orders & Billing Engine"]
        KOT["KOT Dispatcher"]
        INV["Inventory & Recipes"]
        FIN["Cash & Day-Close"]
        SYNC["Offline Sync Gateway"]
    end

    subgraph Data["Persistence & Caching"]
        PG[("PostgreSQL 16\nPrisma ORM")]
        REDIS[("Redis 7\nCache & Pub/Sub")]
    end

    subgraph Providers["Provider Abstraction Layer"]
        PR_STORAGE["StorageProvider\n(Local, S3, GCS, Azure)"]
        PR_PAY["PaymentProvider\n(Manual, Razorpay)"]
        PR_PRINT["PrinterProvider\n(ESC/POS, Network, USB)"]
        PR_NOTIF["NotificationProvider\n(FCM, SNS, SMTP)"]
    end

    POS -->|"REST & WSS"| API
    ADMIN -->|"REST & WSS"| API
    CAPTAIN -->|"REST & WSS"| API
    KDS -->|"WSS Realtime"| API

    API --> Data
    API --> Providers
```

## 1. Domain Separation & Clean Architecture

1. **Transport Layer**:
   - Controllers handle HTTP routing, query parsing, and OpenAPI annotations.
   - WebSockets gateway manages client connections and broadcasts domain events (`ORDER_CREATED`, `TABLE_UPDATED`, `KOT_READY`, etc.).
2. **Business Rules Layer**:
   - Resides in `@restovyn/business-rules`. Pure TypeScript functions with 0 framework or DB dependencies.
   - Calculates line items, subtotal, tax breakdowns (inclusive and exclusive), service charges, discounts, and split bills strictly in **integer minor units**.
3. **Application & Persistence Layer**:
   - NestJS Services manage transactions, optimistic concurrency, and Prisma client interactions.
   - All mutations write to `AuditLog` when critical operations occur (e.g. `ORDER_ITEM_CANCEL`, `PAYMENT_REFUND`, `TABLE_TRANSFER`, `DAY_CLOSE`).
