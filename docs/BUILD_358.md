# Build 358: Facebook visible unmarked-card and short Ad byline support

**Version:** 0.3.328. **Date:** 2026-11-03. **Status:** source candidate, unreleased.

## Owner report
Build 357 was installed from GitHub, and the user provided a Firefox screenshot of a live **ModRetro** advertisement in the ordinary Facebook feed. The header displays the short disclosure **Ad**, immediately beneath the advertiser's name. The screenshot proves the ad was visible; it does not expose its DOM semantics, prove the exact loaded extension version or quantify time-to-hide in this particular capture.

## Implementation
- Fix the Build 357 visible-viewport scanner's dependency on an explicit article/pagelet landmark. Walk up at most 24 ancestors from a viewport point to identify a safe single-post container using the already vetted card-size and independent-post checks. Stop at feed/main, dialog, forms and navigation; do not hide adjacent organic posts or composer content.
- Require existing exact-label/byline and attribution evidence via `hasAdEvidence`, rather than hiding a card merely because it contains the word Ad.
- Coalesce short viewport-only rescans for React DOM insertions as well as scrolls, with an at-most-once-per-120ms timer. Preserve the original mutation fast pass, global fallback, active/allowlist gates and mobile/Marketplace separation.
- Add aggregate `visibleFallbackHidden` diagnostics, without text/URLs/identifiers.
- Five new offline mock tests cover a no-landmark ModRetro-like header, ordinary posts, on-screen deduplication, conditional guards and 120ms mutation/scroll coalescing.

## Acceptance
Real Firefox behavior, live Facebook DOM semantics, long-feed latency and update/reload are still unverified after this commit. Keep Build 358 a source-only candidate; no tag, no public release, no permissions, layout or CI changes.

## QA follow-up
The Build 357 scroll regression was updated to verify the Build 358 shared viewport scheduler instead of its replaced, scroll-only timer variable. The same scroll, active-state, and no-broad-scan intentions remain covered.
