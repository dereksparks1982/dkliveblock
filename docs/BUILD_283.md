# Build 283 / v0.3.253: Full Linux regression audit and targeted corrections

**Date:** November 2, 2026. **Branch:** `main` only.

## Why this build
Build 282 covered 19 isolated Nesty integration tests but had never run the full native Linux regression suite. The owner has permitted rare, high-value GitHub Actions runs. We added one tightly scoped Ubuntu 24.04 verification workflow for this integration gate: on initial workflow change or manual dispatch only, read-only checkout, no secrets, no artifacts, no recurring CI, and a 15-minute cap. GitHub Pages' existing managed publishing checks are separate.

## First genuine Ubuntu test run
Run [41538630300](https://github.com/dereksparks1982/dkliveblock/actions/runs/41538630300) completed with **1,232 Node cases: 1,214 passed and 18 failed**, and 6/6 Python companion scripts passing. Four of seven offline phases passed; structure, offline regressions and release audit failed. No browser was opened. This is the baseline that motivated targeted repairs, **not** passing certification.

## Fixes after the first run
- Fix an actual Nesty Popup Guard transition bug: confirming that a blank child tab becomes an XNXX video tab no longer immediately invalidates the original source/child link. The source-tab takeover test covers this, while foreign navigation, tab close and paused-site guards remain.
- Do not present popup or main-frame navigation allowances as ordinary reversible resource allowances in Site Dashboard.
- Remove misleading unnamed filtering source labels from YouTube diagnostics; retain observed XHR counts and privacy.
- Reject malformed original-host inputs in synthetic native/Ghostery verdict comparison.
- Preserve the trust boundary: ordinary content scripts cannot add persistent cosmetic rules.
- Restore current dependencies/fixture semantics in older Facebook rail, DOM observer, cosmetic priority, Meta UI, Nesty version and streaming diagnostics tests. Keep unverified provider classification unverified; do not weaken false-positive guards to satisfy old assertions.
- Replace the obsolete blanket GitHub Actions ban in the test runner, release audit and related tests with a restricted policy. Update AMO license disclosure check to match the owner-approved free internal business use, not a contradictory historical phrase.

## Unchanged and still gated
Existing Firefox network filter engines, YouTube/Disney+ response logic, Facebook ad decision criteria, GraphQL default-off, approved website/banner, account permissions, Nesty role names and legacy aliases are intentionally preserved. Native Linux checks cannot certify Firefox ad outcomes, page flashing, Orion, Yandex or public release. AMO preflight identified a missing real npm lockfile for reproducible packaging; never synthesize a fake one or claim release readiness. Live owner Firefox acceptance and separate browser port tests remain pending.

**Post-fix second full test run:** pending. Record the actual run and failures below before marking complete.
