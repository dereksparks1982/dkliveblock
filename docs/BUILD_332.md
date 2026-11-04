# Build 332: Facebook diagnostic race safety

**Version:** 0.3.302. **Status:** source-only, unreleased.

A user may click Check twice on a slow Facebook page. The earlier async read could complete last and replace newer evidence, even though each individual request checked tab navigation. A monotonic request-generation token now invalidates all older in-flight work after the initial tab read, detector reply, GraphQL wait/final tab check and error handling. During a new check the export button remains disabled until the newest report is ready. Saved bilingual messages and JSON schema unchanged.

Five source-contract regressions registered. No blocking, telemetry, UI geometry, privileges or transport changes. Real Firefox race tests and native Ubuntu suite pending.
