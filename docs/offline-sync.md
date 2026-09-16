# Offline POS Synchronization Architecture

RestoVyn Desktop POS provides reliable offline operation during network disruptions.

## 1. Synchronization Flow

```mermaid
sequenceDiagram
    participant POS as Desktop POS (UI)
    participant SQLite as Local SQLite DB
    participant SyncWorker as Background Sync Worker
    participant API as Central NestJS API
    participant Postgres as Primary PostgreSQL DB

    Note over POS, Postgres: Network Disconnected (Offline)
    POS->>SQLite: Insert Order (syncId = UUID, syncStatus = PENDING)
    POS->>SQLite: Queue entry into local sync_queue table
    SQLite-->>POS: Order created locally with offline number ORD-OFF-101

    Note over POS, Postgres: Network Restored (Online)
    SyncWorker->>SQLite: Read PENDING entries from sync_queue
    SyncWorker->>API: POST /api/v1/sync/push (Batch payload with idempotency syncId)
    API->>Postgres: Atomic Transaction: Check syncId unique constraint
    alt First Time Ingested
        API->>Postgres: Create Order & Allocate Server Order Number
        API-->>SyncWorker: 200 OK (Status: APPLIED)
        SyncWorker->>SQLite: Update local order status = SYNCED
    else Duplicate Retry
        API-->>SyncWorker: 200 OK (Already applied)
        SyncWorker->>SQLite: Update local order status = SYNCED
    end

    SyncWorker->>API: GET /api/v1/sync/pull?since=lastSyncTimestamp
    API-->>SyncWorker: Returns catalog delta (menu, prices, table definitions)
    SyncWorker->>SQLite: Upsert local SQLite cache
```

## 2. Conflict Resolution Policies

| Entity            | Authority           | Policy                                                                                        |
| ----------------- | ------------------- | --------------------------------------------------------------------------------------------- |
| **Menu & Prices** | Server              | Master catalog on server always overrides local cache.                                        |
| **Orders**        | State-Machine Merge | If server order is already BILLED or CANCELLED, offline amendments prompt cashier for review. |
| **Payments**      | Append-Only         | Offline cash payments are logged; online payments require live gateway verification.          |
| **Stock**         | Ledger Delta        | Offline sales emit negative delta movements rather than overriding absolute balance.          |
