# Build 282: Nesty coordinator hardening and regression coverage

**Version:** 0.3.252  
**Date:** November 2, 2026  
**Scope:** Reliability and integration only. No new blocking behavior, website
geometry changes, feature expansion, or new browser support claims.

## Changes
- The shared Nesty coordinator now accepts only catalog-recognized technical
  evidence tokens. Arbitrary strings, account-like identifiers and page text
  cannot be treated as valid evidence simply because they fit a short regex.
- Explicit `protected_context` suppresses all proposed matches and detector
  reviews. The experimental offline synthetic score stays non-authoritative.
- Dispatcher detectors register once per coordinator instance, not repeatedly
  on each inspection. Catalog vocabulary is cached for steady-state performance.
- Yandex Browser is identified as Chromium-family even if a user-agent string
  lacks a Chrome token. Network-backend negotiation still fails closed when
  required APIs are absent. This does NOT implement a Yandex extension port.
- Added eight dedicated regression tests for evidence filtering, protected
  content, no cross-platform Meta hiding, dispatcher reuse, read-only actions,
  opt-in/provider bounds, browser capabilities and single-source packaging.
- Registered the Build 282 regression file in the regular offline Linux test
  runner (`scripts/test-local.sh`); this registration is not a claim that the
  complete runner was executed in this environment.

## Verification completed
- 19 targeted integration tests (11 from Build 281 plus 8 from Build 282)
  passed in an isolated JavaScript harness using current and staged GitHub
  source. Additional initial source-level contract checks covered platform
  routing, provider isolation and false-positive safeguards.
- JavaScript syntax and manifest/package JSON were checked before commit.
- Version synchronizes to 0.3.252; core Firefox blocking, GraphQL defaults,
  site allowlists, translation, banner and Nesty role IDs are untouched.
- These checks are **not** a run of the native Node test command and are **not**
  real Firefox/Orion/Yandex acceptance tests. Do not record those as passing.

## Open quality gates
1. Run the full repository `npm run test:local` on Linux.
2. Retest previously working Firefox blocking paths without regressions.
3. Test Facebook rapid-scroll ads, account controls, ordinary posts, rail and
   false positives in a real browser.
4. Test the Orion DOM candidate separately. Chromium/Yandex MV3 network adapter
   remains unbuilt; do not promise parity.
5. Only after these gates, consider promoting any reviewed evidence into a
   separately tested, reversible protection policy.
