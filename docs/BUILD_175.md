# Build 175: native request matching fast-paths

**Unreleased source version:** 0.3.145 (2026-10-31).

## Changed
- In `src/engine.js`, a request's target hostname is parsed once by `checkRequest()` and passed to `candidates()`; previously the same URL was parsed again just to collect hostname-anchored rules.
- The existing `candidates(url)` signature remains available to code and tests that do not precompute the hostname.
- If there are no unanchored token-indexed rules, candidate collection avoids the per-character URL scan and token de-duplication Set allocation entirely. Generic, host-anchored, unanchored-token, exceptions, important and site-specific rules retain their existing precedence/order.
- Added regression tests for single hostname parsing, candidate equivalence, host-only/generic rules, and unanchored token rules.
- The standalone offline performance audit now records hostname parse calls over its synthetic requests as well as timing/heap metrics. It restores any instrumented helper even when matching throws.

## Verification
Executed both baseline and modified `rules.js`/`engine.js` sources in an isolated V8 harness with a simple URL shim. Compared **1,008 synthetic request/method/site decisions using 17 mixed filter rules: zero differences**. For 100 separate requests, the old engine called the target URL hostname parser 200 times; the candidate called it 100 times. Also confirmed candidate sets identical across four fixture URLs, and host-only/generic rules still block. This is operation-count evidence, not a wall-clock speedup or real-browser benchmark. Changed JS syntax passes. The **complete Node/Python Linux test suite and actual Firefox timing measurements have not been run**. Do not claim quantified speedup or YouTube compatibility from this audit alone.

No streaming-response or page-bridge changes, no UI changes, new permissions, GitHub Actions, downloads, or release.

**Next: Build 176**. Expand synthetic filter-matching parity checks, including exceptions, explicit manual rules, and mixed request methods, then prioritize any confirmed divergences before the next browser acceptance window.
