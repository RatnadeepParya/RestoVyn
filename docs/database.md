# RestoVyn Database Design & Data Integrity

## 1. Core Principles

1. **UUID Keys**: All primary keys utilize RFC 4122 v4 UUIDs generated via `@default(uuid())`.
2. **Integer Minor Units for Money**:
   - Stored in `Int` fields (e.g. `basePrice`, `subtotal`, `grandTotal`, `amount`).
   - Standard currency: INR (paise: `100 paise = ₹1.00`).
   - Avoids all floating-point rounding errors and precision loss during aggregation.
3. **Optimistic Concurrency**:
   - Models like `Order` possess an incrementing `version Int @default(1)` counter.
   - Prevents race conditions between mobile Captain updates and POS Cashier billing.
4. **Append-Only Ledgers**:
   - `StockMovement`: All inventory adjustments are tracked as historical delta rows. No manual overrides of stock balance without an audit row.
   - `CashTransaction`: All drawer operations (sales, drops, refunds, opening float) append to the cash session.
   - `AuditLog`: Immutable history of critical restaurant mutations.
5. **Offline Idempotency**:
   - `syncId String? @unique` on `Order` and `SyncQueue` prevents duplicated orders when the POS sync engine retries upon reconnection.
