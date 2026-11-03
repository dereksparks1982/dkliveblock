# Build 291 / v0.3.261: Coarse video-spacing geometry evidence
**Date:** November 2, 2026. **Branch:** `main`. **Status:** source milestone, real Firefox acceptance pending.

## Owner problem
Pornhub advertising was blocked in the owner's browser, but two existing video thumbnails appeared separated by a large blank space. Builds 288–290 introduced opt-in, Pornhub-only CSS reflow, on-demand local count-only diagnostics and Nesty Layout Scout suggestions. Count-only evidence could not tell whether adjacent video tiles really appeared separated by a wide gap.

## Integrated geometry measurement
- `src/layout-reflow.js` now exports a side-effect-free `measureHorizontalGaps()` helper used **only by explicit Site Dashboard diagnostics**. It reads viewport-relative rectangles of up to 120 already-validated thumbnail cards per list, at most 12 approved Pornhub video lists. Normal periodic scans never run geometry measurements.
- Counts at most one observation per pair of valid, adjacent, same-row tiles; rows must align vertically within 12 CSS pixels, widths must be between 80 and 1200 px and rectangles must be finite. Overlaps, wraps, hidden, virtualized, malformed, and throwing rectangles are ignored.
- A gap is **suspected unusually wide** only if larger than both 56 CSS pixels and 40% of the narrower card width. The report returns only four bounded integers: sampled cards, same-row pairs, wide-gap pairs and largest quantized wide-gap size (8px buckets, 4096px cap).
- No coordinates, individual tile identity, video titles, URLs, layout HTML, cookies or account information leave the local page or are persisted. Pixel counts are approximate geometry hints, **not evidence that the empty region contained an ad**.

## Nesty and UI
- The existing `Nesty Layout Scout` verifies the optional coarse geometry object, refuses impossible or malformed counts, produces fixed categories `wide-video-gap-measured` and `wide-gap-after-reflow` and recognizes when measurements change between explicit checks. Older count-only evidence continues working.
- The existing Site Dashboard displays the pair count and largest coarse gap and gives a fixed, manual-action suggestion. It adds **no new buttons**, no automated CSS, no extra permissions, no telemetry and no model runtime.
- The Pornhub-only `compactVideoGrids` option remains OFF by default. No video content or login/playback flow is modified. A physical measured gap is not the same as proof the page is fixed.

## Tests and acceptance gates
- Eight deterministic Node cases added and registered covering large gaps, normal spacing, row wraps, unsafe rectangles, boundedness, privacy, scout normalization, repeat signatures and unchanged source integration.
- Native full Ubuntu suite, Firefox page markup, responsive resizing, long scroll/video click checks and user-visible before/after screenshot measurement **still require acceptance**. Do not promote layout reflow to verified until those checks are performed.

## Follow-on
Collect owner-approved actual DOM/visual gap evidence on Pornhub and refine *specific approved layouts* if the existing grid never qualifies. Then extend the read-only geometry laboratory to independently verified sites. Keep Nesty review-only until real-world false-positive metrics justify more automation.
