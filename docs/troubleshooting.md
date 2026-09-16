# Troubleshooting & Operational Runbook

## 1. Database Connectivity Issues

- **Symptom**: `PrismaClientInitializationError: Can't reach database server at localhost:5432`
- **Remediation**:
  1. Verify PostgreSQL container is running:
     ```bash
     docker ps | grep postgres
     ```
  2. If stopped, restart containers:
     ```bash
     docker compose -f docker-compose.dev.yml up -d
     ```
  3. Verify connection string in `.env`.

---

## 2. Desktop POS Offline Mode Active

- **Symptom**: Yellow offline banner displayed in Desktop POS header.
- **Remediation**:
  - The POS automatically stores new orders, KOTs, and cash transactions in local SQLite.
  - Check local network connection between POS terminal and central server LAN IP.
  - When connection is restored, the sync worker pushes queued batches to `/api/v1/sync/push`. Check `/api/v1/sync/pull` for delta updates.

---

## 3. Concurrency Conflict on Order / Table

- **Symptom**: `409 Conflict: Order was modified by another user (current version: 3, expected: 2)`
- **Remediation**:
  - Another staff member (e.g. Captain or Manager) updated the order concurrently.
  - The UI reloads the fresh order state, allowing the cashier to re-apply adjustments on the latest version.
