# Build 280 / v0.3.250: Facebook feed fast-path (November 2, 2026)

## Owner-observed baseline
In Firefox Build 279 the owner observed Facebook right-rail advertisements flash and disappear promptly, while scrolling feed advertisements could remain visible long enough to click. Repeated scrolling showed ads removed later and organic posts filling their slots. This is a genuine observed DOM-removal success, not evidence of zero-flash prevention.

## Changes
- Inspect only recently inserted or changed Facebook subtrees synchronously in the existing MutationObserver callback. This prioritizes new posts before the next paint and avoids broad whole-page walks in the immediate path.
- Reuse existing safe single-post, Sponsored-menu, byline, and right-rail evidence checks. Do not hide guessed or unverified content; preserve user exceptions, Contacts, and ordinary posts.
- Coalesce a full fallback Facebook scan at 40–160 ms depending on the previous scan time, rather than waiting a fixed 450 ms. All other websites retain the original 450 ms debounce.
- Bound fast-path mutation processing to 40 records, 32 roots, 28 candidate cards, 320 inspected label nodes, and 15 removals.
- Add Build 280 fixture checks and register the new test in the local Ubuntu suite. All Orion, streaming, banner, UI, Ghostery, and network interception code remains unchanged.

## Acceptance
Source and bounded synthetic fixture validation only. The owner must retest rapid Facebook scrolling to establish the actual on-screen timing; no blanket claim that every ad is hidden before paint. Full Ubuntu seven-phase suite and browser integration verification remain outstanding.
