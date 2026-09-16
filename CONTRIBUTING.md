# RestoVyn Contribution & Governance Guidelines

## 1. Branching Strategy & Merging Rules

RestoVyn enforces strict branch protection and approval controls:

- **`master` Branch**: Production-ready, locked branch.
  - Direct pushes are strictly **prohibited**.
  - Merges are **only permitted via Pull Requests**.
  - **Critical Rule**: A Pull Request into `master` **MUST ONLY be approved by the repository owner (@RatnadeepParya)**.
  - All CI checks (`lint`, `typecheck`, `test`, `build`) must be green before merging.
- **`develop` Branch**: Main staging integration branch.
- **Feature / Bugfix Branches**:
  - `feat/<feature-name>` for new capabilities
  - `fix/<bug-name>` for defects
  - `chore/<task-name>` for maintenance & configuration

---

## 2. Core Architectural Principles

When contributing code, ensure adherence to:

1. **No Floating-Point Money**: All financial quantities (prices, taxes, discounts, totals) must use integer minor units (paise/cents).
2. **Infrastructure Decoupling**: Business logic services must never directly import cloud-specific SDKs (AWS, GCP, Firebase). Use the provider abstraction interfaces in `@restovyn/types` and `services/api/src/core/providers`.
3. **Server-Side Authorization**: Every state change, discount, refund, or status transition must be validated in NestJS guards and services.
4. **Idempotency & Concurrency**: Order creation, payments, and offline sync submissions must use idempotency keys and optimistic locking (`version`).
5. **No Fake Functionality**: Features must be backed by real APIs, domain logic, and persistent storage.

---

## 3. Pull Request Submission Steps

1. Create a branch off `develop` (or `master` for urgent hotfixes).
2. Ensure local validation passes:
   ```bash
   pnpm lint
   pnpm typecheck
   pnpm test
   pnpm build
   ```
3. Open a Pull Request referencing relevant GitHub Issues.
4. Request review from **@RatnadeepParya**.
5. Once approved and CI checks pass, squash and merge into `master`.
