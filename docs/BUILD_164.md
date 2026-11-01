# Build 164: manual cosmetic exceptions govern every hiding layer

**Unreleased 0.3.134, October 31, 2026.**

A user-selected `news.example#@#.ad-slot` allowance already controlled native CSS but did not reliably protect against automatic DOM ad recognition or supplemental embedded Ghostery cosmetic CSS.

- `background.js` sends a bounded list of exact-site validated cosmetic exceptions with `getStyle`, and prevents supplementary Ghostery CSS from re-hiding exact selector matches.
- `ad-recognition.js` adds `setExceptions`, which respects matching selectors and allowed ancestors, safely restores previously hidden tracked DOM nodes when an exception is added, and can re-enable ordinary scanning when removed.
- `content.js` refreshes the recognizer's exceptions from the trusted background response; stale async replies still lose to the refresh sequence.
- Tests cover adding/removing allow rules, ancestor exceptions, malformed selectors, CSS vendor exclusion, and background message propagation.

**Scope:** No new permissions, remote scripts, unrelated page changes, redesign, UI geometry changes, GitHub Actions or public release. Full Node/Python and real Firefox tests have NOT been executed; this build's source and targeted syntax were inspected only.
