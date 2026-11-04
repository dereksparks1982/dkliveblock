# Build 357: prioritize immediately visible Facebook feed ads

**Version:** 0.3.327. **Date:** 2026-11-03. **Status:** unreleased source candidate.

## Owner-reported regression
After updating local source to Build 356, Facebook feed Sponsored posts continued to remain visible for roughly 30 seconds before disappearing. Repository update was confirmed, but the running Firefox extension revision was not independently verified.

## Targeted change
- Introduce `scanVisible()` to sample fifteen on-screen positions (five viewport rows across three feed columns) without traversing all document element rectangles. Resolve only recognized article or FeedUnit cards.
- Apply existing `safeCard()` and `hasAdEvidence()` gates and site-specific exceptions. No blanket text matching or CSS concealment of ordinary articles.
- Run this scan before the rotating full-document feed scan and on coalesced 120ms scroll events, without making every scroll trigger an expensive global scan.
- Expose aggregate `visibleScans` and `visibleHidden` diagnostic counts without URLs, post text or user identifiers. Preserve desktop/mobile/Marketplace boundaries.

## Verification and remaining uncertainty
- Focused offline mock tests cover visible sponsored post priority, ordinary post preservation, paused/disabled gating, repeated scans, unsupported viewport or mobile/Marketplace exclusions.
- Not yet run in the owner's Firefox. A 30-second delay may also be caused by the previously updated source not having been reloaded in Firefox, asynchronous site changes, or ad markup that does not match current proof-of-ad rules.
- No additional permissions, UI geometry changes, background network rules, CI runs, release tag or public release.
