# Build 209: retain site-specific cosmetic rules under large subscriptions

**Version:** 0.3.179, unreleased. **Observed-working YouTube baseline:** Build 203 remains snapshotted and tagged.

## Problem

The native cosmetic index stored global selectors before host-scoped ones. The Firefox background `getStyle` path fetched every matching selector and then truncated the array at 15,000 entries. With a sufficiently large combined generic list, a site's explicit `site.example##.sponsored` rules could be present in memory yet never reach the page's CSS.

## Fix

- `FilterEngine.getSelectors(host, policy, limit)` accepts an optional cap. It gathers matching global and site rules and applies exceptions as before. When the result **exceeds** the cap, explicit domain-scoped rules receive priority, with the remaining space filled by global results. When no cap is requested or the result fits, the historical order is retained. The public two-argument API is unchanged.
- The existing `getStyle` call passes its already-approved 15,000-selector cap into the engine, before its existing video/auth selector safety gates and CSS output cap. No cosmetic execution behavior, DOM geometry or permissions were modified.
- `tests/cosmetic-priority.test.js` checks a 15,003-entry generic list, two explicit-site selectors, exception and policy precedence, small-list ordering, and the real `getStyle` source integration. Registered in the local Linux offline runner.

## Evidence and boundaries

Four focused synthetic tests passed. All changed JavaScript passed syntax checks. Complete Ubuntu/Node suite and live Firefox stylesheet construction and actual list performance remain unverified. A full browser test must ensure that site forms, sign-in, media players, and explicit exemptions continue behaving normally.

This build does not alter the YouTube page bridge, response rewriting, filter subscriptions, new-tab navigation controls, user interface geometry, the public README, the archived Build 203 tag, or the local backup.

No GitHub Actions or public release created.
