# Build 341: extended multi-build audit

**Version:** 0.3.311. **Status:** source-only, unreleased.

Repair remaining version-frozen test fixtures from the cross-build integration run, then extend the existing source-only integrity auditor's post-324 test registry to all fixtures through Build 341. The historical 16-build checkpoint's list and semantics remain immutable for earlier regressions. The Build329 test accepts an expanded list while retaining its previous minimum. Five new tests enforce exact-source integrity, test files present, runner registrations, no frozen SemVer and no fictitious Firefox/release acceptance.

The test runner is still for Ubuntu local operation. Isolated source/V8 checks are not proof the entire suite, real playback, Facebook sponsored removal or Orion device testing passed. No production blocking, account, network or browser privileges change.
