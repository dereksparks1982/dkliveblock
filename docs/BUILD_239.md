# Build 239 (0.3.209): Integrated Ad Investigator, visible controls, portability

Owner direction: aggressive ad/tracker protection with transparent, reversible owner decisions, not uncompromising site breakage. Integrate existing best-in-class tools: element picker, cosmetic debugger, request log, filter-rule evidence and individual host/type controls. Avoid duplicate filters and avoid calling synthetic AI scores real probability.

### Implemented
- Private, movable on-page inspector: DOM ancestry (tags/roles/dimensions only), optional per-level outline, matching CSS selectors as possible evidence, and direct access to existing DK Network Monitor, rule-provenance Site Dashboard and Cosmetic Debugger.
- Read-only network destination summary from opt-in, memory-only capture; purpose hints labeled as unverified, grouped destination/type counts link to existing request detail filters.
- Cyan/dark accessible sliding Allow/Block controls in Monitor and Dashboard; popup's global protection similarly styled. Native checkboxes, confirmations, scoped rules, errors and reversal remain in control.
- Original DK icon + LIVE BLOCK heading in popup, and cyan/white/black button priorities, without changing layout. Existing investigator startup site exceptions restored and drag position retained.
- Firefox/Chrome/Edge capability negotiation and one-source build-target plan; Chrome/Edge packages deliberately blocked until Chromium MV3 DNR and service worker port validated. No new extension permissions or new browser store release.
- Public homepage only names mainstream site tests; no adult/piracy marketing. README kept as requested without build status notes; all engineering and acceptance details are in docs.

### Validation
Eight new investigator-focused source tests passed in an isolated JavaScript harness and capability model smoke checks passed for simulated Firefox, Chrome and Edge. An additional five focused compatibility test cases are in the local Node suite, which **has not been run in full** here. The seven-phase Ubuntu regression test, real Firefox UI, actual automatic Facebook ad removal, production Chrome/Edge behavior and independent competition benchmarks all remain unverified. No public release or install package created.

### Known owner observation
Login and account creation at NBCUniversal through Google sign-in completed successfully with DK Live Block enabled. Preserve this behavior; do not globally exempt Google resources.
