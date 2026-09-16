# Security Architecture & RBAC Policy

## 1. Authentication & Session Security

1. **Centralized JWT**:
   - Access tokens signed via SHA-256 with 8-hour expiry.
   - Refresh tokens stored with 7-day expiry and revocation support.
2. **POS Fast PIN Login**:
   - For rapid staff switching at physical POS registers.
   - Staff PINs (4-6 digits) are never stored in plaintext. They are hashed with PBKDF2/bcrypt.
3. **No Secret Hardcoding**:
   - All credentials, DB URLs, and API keys reside in `.env` or external secret managers (AWS Secrets Manager, GCP Secret Manager, Azure Key Vault).

---

## 2. Server-Side Role-Based Access Control (RBAC)

Authorization is strictly enforced in backend NestJS Guards (`JwtAuthGuard`, `RolesGuard`, `PermissionsGuard`):

```text
OWNER
 └── Unrestricted system access, settings, audits, backups

MANAGER
 └── Order voids, item cancellation, high discount approvals, staff shifts, day-close

CASHIER
 └── Order creation, billing, payments, cash session, thermal printing

CAPTAIN
 └── Floor plan, table occupancy, order taking, KOT dispatch, bill request

KITCHEN
 └── KDS ticket status, preparation timers, priority queue

INVENTORY_MANAGER
 └── Stock intake, purchase orders, recipes, wastage logging

ACCOUNTANT
 └── Sales reports, tax audits, expense verification, payment reconciliation
```
