# Build 359: complete Inky MIT Facebook integration

**Version:** 0.3.329. **Date:** 2026-11-03. **Status:** unreleased and awaiting complete Ubuntu suite + real Firefox acceptance.

The entire original source is retained at `src/vendor/facebook-sponsored-upstream.js`, and the complete adapted runtime lives at `src/facebook-full-core.js`, active in top-level Facebook only. The previous partial DK Facebook DOM scanner is replaced, not run beside it. Original MIT license and attribution remain.

## All ten user-requested complete feature paths
1. Unlabeled advertising: `sweepUnlabeledAds` with outbound links, CTA buttons, dangling labels, timestamps, permalink and independent-post vetoes.
2. 50ms pending-label retry: `retryPendingLabels`, 40-label cap, 8-second expiry.
3. Late portal reverse resolution: `resolveViaReferrer`, `noteLabelledByChange` and ephemeral SVG/text caching.
4. Whole-post selection: `wholePost`, `expandToCard`, `includeByline`, dialogs and independent-post guards.
5. Original complete bounded CSS-order, honeypot and invisible-character decoding; Russian exact ad labels also recognized.
6. Complete underlying observer/retry/anchor/failure timing diagnostics. Only safe aggregate counters are exported by DK.
7. Mark advertisers, protect Pages and offer in-post This is an ad / This is NOT an ad controls.
8. Independent Sponsored, Suggested and Follow/Join/unfollowed filtering.
9. Optional placeholder Show / Always show and permanent trusted-Page restore.
10. Optional Stories, Reels and People You May Know section cleanup.

## DK integration
Dedicated English/Russian settings page linked from Options and Site Dashboard; existing DK enabled, site allowlist, temporary pause, element picker, and cosmetic exceptions take priority. Optional non-ad feed removal and markers default OFF. Unlabeled-ad detection is ON to match upstream and explicitly warns of false positives. No permissions, public UI geometry, third-party network calls, CI jobs or public release changed.

## Remaining acceptance
Source compile, manifest/order/controls/license and targeted integration assertions checked; the complete native Ubuntu suite and live Firefox are not yet run. Do not claim the 15–30-second Facebook ad flash is fixed until tested.
