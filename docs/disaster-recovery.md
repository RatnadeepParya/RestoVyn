# RestoVyn Enterprise Disaster Recovery & Resilience Runbook

This runbook outlines the standard operating procedures (SOPs) for high-availability restaurant operations, failover protocols, and disaster recovery.

---

## 1. Resilience Metrics & Targets

| Metric                             | Target           | Description                                                                         |
| ---------------------------------- | ---------------- | ----------------------------------------------------------------------------------- |
| **RPO** (Recovery Point Objective) | **< 5 minutes**  | Maximum allowable data loss window in the event of catastrophic server destruction. |
| **RTO** (Recovery Time Objective)  | **< 15 minutes** | Maximum allowable time to restore full POS billing and Kitchen KDS dispatch.        |
| **Edge Uptime Target**             | **99.99%**       | Local restaurant LAN availability during business operating hours.                  |

---

## 2. Architecture for High Resiliency

```text
                     INTERNET CLOUD (Optional Sync)
                               ▲
                        AWS S3 / GCP GCS
                               ▲
             (Nightly Encrypted Backup Sync)
                               │
            ┌──────────────────┴──────────────────┐
            │   RESTAURANT ON-PREMISE EDGE BOX     │
            │   (Intel NUC / Core i5 / 16GB RAM)   │
            │                                     │
            │   ┌─────────────┐   ┌─────────────┐ │
            │   │  NestJS API │   │  PgBouncer  │ │
            │   └─────────────┘   └─────────────┘ │
            │          │                 │        │
            │   ┌─────────────┐   ┌─────────────┐ │
            │   │   Redis 7   │   │ Postgres 16 │ │
            │   └─────────────┘   └─────────────┘ │
            └──────────────────┬──────────────────┘
                               │ Local Ethernet & Wi-Fi
            ┌──────────────────┼──────────────────┐
            │                  │                  │
      Desktop POS 1      Desktop POS 2      Kitchen KDS
     (Local SQLite)     (Local SQLite)     (Real-time LAN)
```

---

## 3. Disaster Scenarios & Recovery Procedures

### Scenario A: Total Internet WAN Drop (ISP Fiber Cut)

- **Impact**: Zero cloud communication; offsite sync paused.
- **Operating Procedure**:
  1. The on-premise RestoVyn edge server continues running on the local restaurant subnet (`192.168.1.0/24` or `restovyn.local`).
  2. Waiters continue using handheld Captain tablets communicating via local Wi-Fi.
  3. Desktop POS continues operating. Even if the local edge server is temporarily unreachable, Desktop POS operates in **Local SQLite mode** and automatically syncs all tickets and cash receipts upon reconnection.
  4. Kitchen Display Systems (KDS) receive KOTs via local WebSocket events.
- **No manual intervention required.**

---

### Scenario B: Database Corrupt / Accidental Data Destruction

- **Impact**: API services rejecting requests or reporting corrupted data.
- **Operating Procedure**:
  1. Put the restaurant POS in offline mode temporarily.
  2. Inspect available backups:
     ```bash
     ls -lh /opt/restovyn/backups/
     ```
  3. Execute automated restoration with SHA256 checksum verification:
     ```bash
     ./scripts/restore-db.sh /opt/restovyn/backups/restovyn_backup_YYYYMMDD_HHMMSS.sql.gz
     ```
  4. Run database health check:
     ```bash
     ./scripts/health-check-agent.sh
     ```
  5. Instruct Desktop POS terminals to re-sync any offline buffered tickets.

---

### Scenario C: Edge Hardware Failure (Motherboard/Power Supply Burnout)

- **Impact**: Edge server is completely dead.
- **Operating Procedure**:
  1. Procure the spare cold-standby Mini PC / NUC kept on-site.
  2. Boot the spare machine and pull the latest backup archive from the secure offsite cloud bucket:
     ```bash
     # From AWS S3
     aws s3 cp s3://restovyn-flagship-assets-prod/backups/latest.sql.gz /opt/restovyn/backups/

     # Or from Google Cloud Storage
     gcloud storage cp gs://restovyn-assets-prod/backups/latest.sql.gz /opt/restovyn/backups/
     ```
  3. Run the edge appliance installer:
     ```bash
     sudo ./infrastructure/edge/edge-setup.sh
     ```
  4. Restore the database:
     ```bash
     ./scripts/restore-db.sh /opt/restovyn/backups/latest.sql.gz
     ```
  5. The spare server assumes `restovyn.local` on the LAN. POS terminals and Captain apps reconnect within 60 seconds without reconfiguring IP addresses.

---

### Scenario D: Kitchen Thermal ESC/POS Printer Failure

- **Impact**: Physical printer jams, paper run-out, or hardware failure.
- **Operating Procedure**:
  1. RestoVyn KDS (Kitchen Display System) touchscreen displays all active KOT tickets digitally with prep timers, ensuring kitchen operations are never blocked by physical paper jams.
  2. To re-route KOT print jobs to a backup kitchen printer:
     - Open Admin Web Panel -> **Printers & Stations** (`/printers`).
     - Update the station routing rule for the affected station to target the backup printer's IP address.
     - Click **Test Print 80mm**.
