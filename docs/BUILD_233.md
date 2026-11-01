# Build 233 (0.3.203): Facebook-only sponsored-content repair

**Status: source committed; owner Firefox acceptance pending.** Facebook remains FAIL based on Build 232 screenshots until actual successful Build 233 retest.

## Problem evidence

- A main-feed advertisement from Dawn of Jets displayed its 'Ad' label while the extension remained active.
- Two right-side cards remained under the 'Sponsored' heading. A specialized open-source reference (Inky, MIT) and uBO's public quick-fixes confirm Facebook varies its labeling and container layout.
- A permitted-request export contained 490 completed requests with active protection, primarily first-party Facebook/fbcdn traffic. It does not identify ad payloads, and cannot justify broad network blocking.

## Implemented

1. In `src/facebook-ads.js`, recognize site-specific sponsored-content menu accessibility strings independently of whether a short visual 'Ad' byline is exposed.
2. Reconstruct tightly bounded nested span labels with CSS order, visible/hidden filtering and high/low decoy-class-count variants, retaining Unicode normalization.
3. Scan visible Sponsored headings without requiring `role=complementary`; restrict removable containers to narrow right-side ad sections, not whole sidebars, contacts, feed, navigation or forms.
4. Scan [role=article], FeedUnit and aria-posinset cards as before; add a restricted fallback for explicit ad-menu and /ads/about evidence in feed cards lacking those landmarks.
5. Preserve site-specific manual exceptions, restoration, limits, temporary ad hiding and ordinary Facebook traffic. Observe attribute changes to `data-pagelet` in existing mutation observer.
6. Add tests to the existing Node ad-recognition suite for the known feed and right-rail failures, and safety cases.

## Boundaries

- No permission, network-filter, streaming, Google login, website-button, external-dependency or GitHub Actions change.
- No arbitrary remote JavaScript execution and no new browsing telemetry.
- Browser effectiveness, Reels/Marketplace variation, full Linux suite and performance acceptance remain open. Screenshot-level observations do not establish exact DOM markup. Review in Firefox before marking Facebook PASS.
- Facebook helper retains upstream MIT attribution and bundled notices. This remains a Facebook-specific implementation, not a new generalized filter rule engine.
