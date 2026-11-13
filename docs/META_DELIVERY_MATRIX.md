# Meta advertising delivery matrix
**Build 254 / v0.3.224 · November 1, 2026.** Evidence-based engineering inventory, not a guarantee that every future format can be predicted.

## Why this exists
Meta can alter HTML class names, delivery endpoints, API formats and visual labels. DK must recognize **families of delivery mechanisms** independently, then select evidence-based countermeasures. A mechanism appearing on a page does **not** prove that the particular content is advertising. Shared CDN endpoints, a company owner, a canvas, or a video segment are never sufficient on their own.

The active read-only catalog lives in `src/meta-delivery-catalog.js` and is visible in the dedicated Meta Intelligence viewer under a collapsed **Known Meta advertising delivery methods** section. A method requires a signal AND a separate contextual indicator before it can even produce a review finding. All catalog entries currently return `review` or `observe`, **never block**.

## Mechanisms and countermeasures
| Mechanism | Potential countermeasure | Evidence gate / caution |
| --- | --- | --- |
| Third-party advertising request | Specific host/resource-type filter | Confirm actual ad endpoint and affected site |
| First-party advertising API | Narrow request/API decision | Same origin may deliver legitimate posts |
| GraphQL sponsored object | Schema-bounded JSON pruning | Require tested GraphQL schema, preserve ordinary edges |
| Streamed JSONL sponsored object | Bounded JSONL record filtering | Preserve stream framing, authentication and non-ad events |
| Server-rendered advertisement | Post-scoped DOM hide | Exact label plus real post boundary |
| JavaScript-inserted advertisement | Mutation-observer scanner | Bounded scans, no page-wide hides |
| Shadow DOM advertisement | Open-shadow-root scanner | Closed roots may be inaccessible |
| Embedded iframe advertisement | Frame-scoped filters | Preserve sign-in, CAPTCHA and media |
| Obfuscated/SVG/character-split label | Visually ordered text decode | Require author/rail context |
| Native ad without a label | Evidence review and user control | Shape alone is a false-positive risk |
| Right-hand sponsored section | Sponsored label + rail boundary | Preserve Contacts, Birthdays and chat |
| Sponsored product/listing | Listing-specific marker and card | Avoid normal Marketplace listings |
| Sponsored Stories | Story-specific sponsored marker | Preserve ordinary stories |
| Sponsored Reels | Reel-specific marker | Preserve organic Reels and playback |
| Client-inserted video ad | Player ad-state detection | Never assume any media request is an ad |
| Server-stitched video ad | Confirmed ad-break metadata if visible | Encrypted/indistinguishable segments may be impossible to isolate |
| Static image creative | Ad attribution + isolated image slot | Don't block ordinary image CDN traffic |
| Canvas/WebGL creative | Adjacent advertising evidence | Pixel data alone may not distinguish a promotion |
| CSS-generated/overlay ad | Bounded overlay and attribution | Protect site navigation/controls |
| Redirect/popup advertising | User-navigation vs popunder heuristics | Don't break chosen links and sign-in |
| Tracking pixel | Verified tracking endpoint filter | Retain resource exceptions |
| Click/view attribution | Specific attribution URL/attributes | Avoid broad blocking that breaks commerce |
| Anti-adblock detection | Scoped compatibility/cosmetic protections | Never bypass security or authentication |
| Advertising notifications | User-controlled notification suppression | Respect browser permissions |

## Inventory versus real support
**Currently implemented in DK:** generic network rules, DOM cosmetic filtering, some Meta Facebook post/rail detection, bounded label decoding, original per-site allowlist and exceptions, popup controls, request-monitor evidence, the YouTube video handling path. No claim is made that any individual Meta delivery method has passed live acceptance.

**Not yet implemented in Meta:** reliable first-party GraphQL JSON filtering, JSONL streaming filters, media-specific Meta ad-break handling, robust shadow-root scanning, identification of unlabeled native ads, complete Instagram/Threads/WhatsApp ad adapters, and AI-driven automatic strategy promotion. These require separately documented threat boundaries, licensing checks and regression fixtures.

## Acceptance method
1. Verify scanner enabled and actually scanning in a live browser.
2. Confirm one authentic ad signal and the correctly scoped card or playback surface.
3. Record whether it is blocked, missed, restored or indeterminate. Never infer success from a matched selector alone.
4. Test normal content immediately adjacent, contacts, login, chats, playback, purchases and page performance.
5. Add small fixtures for malformed/nested DOM and a way to roll back each strategy.
6. Activate only independently validated countermeasures. Preserve the successful YouTube baseline.

## Sources
- MIT-licensed Inky `fb-sponsored-ad-post-blocker`, upstream source vendored under `src/vendor/`. Original MIT license preserved.
- uBlock Origin uAssets Facebook quick fixes (GPL-3.0, studied but not copied into the DK engine); these filters require implementing compatible browser scripting semantics.
- DK owner acceptance screenshot: Build 250 still displayed a feed `Ad` post and two right-rail `Sponsored` advertisements. Not yet a verified PASS.

## Build 402: renamed GraphQL ad metadata (November 12, 2026)

Independent October 2026 research identifies `th_dat_spo` as a renamed `sponsored_data` field in sponsored Facebook feed stories. DK's first-party schema-bound GraphQL engine now recognizes it inside previously approved feed, relay, sidebar, Marketplace and search collections. The new field requires an explicit `SponsoredData` type or nonempty short `ad_id`, whereas historical `sponsored_data` ad-ID behavior is unchanged. Generic root `data.node`, GHL parser decoys, messages and user reactions remain untouched; the existing reversible Meta Nesty 05 setting and JSONL/RequireJS bounds stay active. This is source-level implementation, **not live Facebook acceptance**. External research: https://github.com/SysAdminDoc/facebook-ublock-filters and https://github.com/pyxis3-ai/webcleaner (no code copied).
