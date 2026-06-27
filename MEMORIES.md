# Bug Memory

Tracked bugs per the Bug-finding workflow. Only open or rejected PRs are listed here.

| Date | Location | Root cause | PR | Status |
|------|----------|------------|-----|--------|
| 2026-06-28 | lib/storage.service.ts | Multi-tab read-modify-write loses prior tab writes | — | fixed |
| 2026-06-28 | lib/ref-generator.ts | Non-atomic sequence counter produces duplicate refs | — | fixed |
| 2026-06-28 | middleware.ts | Mock cookie grants full access (demo auth) | — | wontfix |

## Fix notes (2026-06-28)

- **storage.service.ts**: Compare-and-swap writes with up to 3 retries; cross-tab `storage` event forwards to `tf-storage-change`.
- **ref-generator.ts**: Sequence increment with collision check via optional `exists` predicate; UUID fallback after 5 attempts.
- **data-service.ts**: All `generateRef` calls pass store uniqueness checks for lead/booking/customer/expense refs.
