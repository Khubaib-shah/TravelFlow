# Bug Memory

Tracked bugs per the Bug-finding workflow. Only open or rejected PRs are listed here.

| Date | Location | Root cause | PR | Status |
|------|----------|------------|-----|--------|
| 2026-07-01 | src/routes/index.ts | No RBAC middleware on protectedRouter allows privilege escalation | — | open |
| 2026-07-01 | src/services/domain.service.ts | findOrCreateCustomerFromLeadDoc fetches all customers causing OOM | — | open |

## Fix notes (2026-07-01)

- **routes/index.ts**: Added `requireRole` middleware to protect `/users` and `/roles` routes against unauthorized access.
- **domain.service.ts**: Replaced memory-heavy `Customer.find()` with optimized `$in` query over generated phone variants.
