# Build 329: extended bounded regression checkpoint

**Version:** 0.3.299. **Status:** source-only.

The audit now checks the new Facebook scan window caps, ephemeral label sampling, Russian exact-label guards and registrations for Builds 325–329, while preserving the historical sixteen-build checkpoint contract required by existing tests. The new checks are read-only source invariants, not browser automation, and retain the explicit false values for live Firefox certification, full Ubuntu-suite acceptance and release approval.

Five mutation-based negative tests cover missing registrations, increased scan budgets, deleted label guards and manifest privilege drift. No UI, blocking policy, external traffic, privileges or release status changes.
