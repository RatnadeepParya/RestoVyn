## Pull Request Details

### Description

<!-- Provide a concise description of what this PR introduces or fixes. -->

### Related Issues

<!-- Reference issues, e.g. Closes #123 -->

### Affected Areas

- [ ] Backend API (`services/api`)
- [ ] Database / Prisma Schema (`prisma/`)
- [ ] Desktop POS (`apps/pos-desktop`)
- [ ] Admin Web Panel (`apps/admin-web`)
- [ ] Captain Mobile App (`apps/captain-mobile`)
- [ ] Shared Packages (`packages/*`)
- [ ] Infrastructure / Docker (`infrastructure/`)
- [ ] Documentation (`docs/`)

---

## Architectural & Quality Checklist

### Financial & Core Rules

- [ ] **No Floating-Point Money**: All monetary quantities use integer minor units (paise/cents).
- [ ] **Server-Side Authorization**: RBAC/permission checks are enforced server-side.
- [ ] **Optimistic Locking**: Order / table mutations respect versioning constraints.
- [ ] **Audit Logging**: Sensitive mutations log to `AuditLog`.
- [ ] **Idempotent Sync**: Offline sync endpoints handle idempotency keys without duplicate creation.

### Verification & Testing

- [ ] `pnpm lint` passes with 0 errors.
- [ ] `pnpm typecheck` passes with 0 errors.
- [ ] `pnpm test` passes with all tests green.
- [ ] `pnpm build` succeeds for all affected applications.
- [ ] Database migrations tested locally (if schema changed).

---

> [!IMPORTANT]
> **Approval Policy**: Merging into `master` requires explicit review and approval from repository owner **@RatnadeepParya**.
