# Build 298 / v0.3.268: Facebook linked-author ad labels, website theme and page navigation
**Date:** November 3, 2026. **Branch:** main. **Status:** source-level build, browser acceptance pending.

## Owner evidence
The owner shared a live Firefox screenshot of the ordinary Facebook feed showing a plainly labeled Meta Glasses **Ad** still visible despite DK Live Block being enabled and the experimental settings active. The popup showed 0 blocked and more than 500 permitted requests. This is evidence of a **missed Facebook feed ad**, not evidence that all permitted requests were ads or that the feed itself should be network-blocked. The screenshot also identified a brown-toned website presentation inconsistent with the chosen dark branding, followed by a request for a Back to top control.

## Facebook repair candidate
- Add a strict `linkedAuthorAdByline` detector for short explicit Ad/Sponsored labels **directly below a real advertiser link** within the upper, left-aligned header area of one safely bounded Facebook feed card. Supports deeply nested markup without role=article or FeedUnit. It does not trust just a brand, video image, link, company name, or ordinary text mentioning advertising.
- Expand non-landmark feed-card ancestor inspection from 14 to 22 bounded steps. Keep post-geometry checks, multi-post wrapper exclusions, form/dialog/rail/Marketplace protections, user exceptions and reversible hides.
- Apply the new evidence check to fast inserted-subtree detection, periodic byline detection, post evidence, and referenced label handling. Preserve the original marker as a recycling recheck trigger so reused organic cards can be restored safely.
- Add nine focused tests covering screenshot-like linked advertisers, split/short labels, ordinary body text, missing authors, protected areas, multi-post wrappers, fast detection, restoration and versioning. **Do not claim screenshot-specific Facebook behavior verified until owner tests the installed build.**

## Website design
- Replace muddy maroon/brown Russian-language page backdrops, cards and dialog backgrounds with neutral black/charcoal and retained metallic gold/red accents. **The exact previously approved Russian banner PNG and the four black/gold/white/red download button order remain untouched**, as do all existing grid and dialog dimensions. English site palette remains intact.
- Add an accessible fixed **Back to top** button to the main public site. It appears only after meaningful scrolling, is localized in English/Russian, has a black/cyan style with keyboard focus, respects motion accessibility preferences, and maintains a mobile safe-area offset. It is separate from the existing modal-specific Back to top controls. Nothing shifts in the approved layout.
- Add eight website tests plus update two earlier pinned expected Russian card colors. No image asset, browser-extension permission, account data, network filter list, or ad blocking path unrelated to Facebook changed.

## Verification
Focused in-memory JavaScript source tests: **9 Facebook and 8 website checks passed**. Website inline script source parses correctly. Exact-commit full Ubuntu offline suite, real Firefox Facebook/organic controls and GitHub Pages visual acceptance are **not yet run**. No production parity or YouTube fix claim is made.

## Next acceptance
Update local checkout, reload extension, compare the same Facebook feed surface under fast scroll and fresh navigation, inspect count-only detector diagnostics. Confirm labeled ads disappear and organic friend posts, comment fields, menus, Messenger and marketplace remain usable. Check public website at desktop and mobile widths, English/Russian banner integrity, and whether the new main-page Back to top appears after scrolling and returns to top.
