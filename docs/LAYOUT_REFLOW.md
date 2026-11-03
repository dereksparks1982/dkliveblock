# DK Live Block: Visual Layout Repair / Empty Ad Space Reflow
**Initiated:** November 2, 2026. **Build 288 / v0.3.258.** **Status:** Firefox source integration and offline testing in progress; owner live browser acceptance pending.

## Why this is needed
The owner reports DK Live Block working on Pornhub, but the page can show two video thumbnails separated by a large, formerly ad-occupied space. Ad blockers may suppress the ad's contents while the site's fixed widths, floats, reserved columns, margins or placeholder wrappers remain. This is distinct from blocking the request or hiding the advertisement.

**Objective:** Move *already-present* legitimate video tiles together and collapse truly empty ad-only placeholders, without loading a different video, inventing thumbnails, clicking links, modifying account activity or editing the site's server-side HTML. A page that only supplies two video cards cannot magically yield a third one.

## Existing filtering and reference approaches
- Our native cosmetic filters and embedded Ghostery cosmetic bridge already hide marked elements using `display:none!important`; they do not generally reposition sibling cards or rebuild a page grid.
- AdBlock's own help notes that page designs can retain blank areas after ads are blocked; their conventional approach uses cosmetic rules: https://helpcenter.getadblock.com/adblock-help-center/blank-spaces-when-ads-are-blocked-by-adblock
- Ghostery's cosmetic filtering discusses cleaning empty spaces: https://www.ghostery.com/features/privacy-protection/ad-blocking/cosmetic-filters
- Adblock Plus documents CSS-property filters for margin/spacing repair: https://help.adblockplus.org/adblock-plus-help-center/how-to-write-filters
- A publicly documented third-party Pornhub Firefox userstyle uses `.videoblock` video cards and a `ul.videos` thumbnail container. Its broad desktop layout replacement is **not copied** here because that style includes unrelated player changes and is not a verified current DOM fixture: https://sleazyfork.org/en/scripts/423982-x-pornhub-widescreen-usercss-userstyle/code

## Build 288: conservative first slice (installed source)
1. Add `src/layout-reflow.js`, bundled locally, no network requests, no new permissions, no downloaded runtime.
2. Limit to the exact Pornhub hostnames `pornhub.com` and `www.pornhub.com` on listing paths: `/`, `/video`, `/video/search...`. The player, sign-in, account, upload, premium, payment, comments and other sites are untouched.
3. Require a `ul.videos` with at least **two** direct `li.videoblock` items containing video links. Fail open if mixed/unknown children, hidden controls or unexpected markup appear.
4. Collapse only **empty, explicitly ad-marked** direct children containing no text, links, buttons, images, iframes or media. Never remove DOM nodes.
5. Add one small local stylesheet that turns only qualified lists into a responsive CSS grid, using safe spacing and neutralizing old video tile floats/widths. No global page restyling and no external CSS.
6. Control through the existing Settings page checkbox `Experimental: compact video-thumbnail grids and empty ad spaces on Pornhub only`. **OFF by default**, reversible immediately by unchecking, turning off protection or refreshing. No change to toolbar size/geometry. Scanner rechecks are bounded and reuse the current content observer/debounce.
7. Record tests for eligibility, preservation of actual video links, refusal of active/unknown ad nodes, no DOM moves/duplications, and restoration. These are simulations, not real Firefox evidence.

## Build 289: read-only evidence before layout expansion
- The existing Site Dashboard now shows a collapsed **Video layout repair · Pornhub** section only when a Pornhub tab is selected. It displays bounded counts of eligible video grids, existing video tiles, truly empty ad placeholders, mixed/unsupported lists and groups currently compacted.
- A **Recheck video layout** button re-reads the same site through an extension-origin-only, exact-tab background message. No video links, DOM markup, account information, text, screenshots or other private data are gathered.
- The diagnostic operates even when the experimental grid switch is off, so it can identify a missing/unsupported layout without changing that layout. It is neither a proof that the gap is fixed nor permission to automatically invent CSS.
- Allowed listing routes are now only `/`, `/video`, `/video/search` and descendants of `/video/search/`. An empty ad-looking placeholder bearing a non-ad accessibility label is protected.
- Owner browser checking and visible markup verification are needed before adding a broader selector. The option is still OFF by default, reversible, and restricted to Pornhub.

## Build 290: Nesty Layout Scout review-only integration
- Registered a new **Nesty Layout Scout** specialist for the distinct responsibility of evaluating visual spacing repairs. The three original specialists and eleven legacy method aliases remain intact.
- Each user-requested Site Dashboard layout report passes **only bounded numerical counts** to the in-content specialist; it never transfers or records videos, titles, URL paths, DOM elements, selectors, personal/account data or page text. No external model or telemetry is used.
- Recommendations are fixed, read-only categories: **consider the existing opt-in compact setting**, **review unsupported markup locally**, **visually compare spacing**, or **take no action** for unsupported/paused/picker/failed cases. No new CSS is generated or applied by Nesty.
- An in-memory counter can note when the **same numeric pattern** appears on successive local dashboard checks, capped at four. Repetition is not evidence that an advertisement was shown or that a visual gap was fixed, and reset occurs on protection pause.
- Existing Pornhub-only CSS behavior remains strictly opt-in and reversible. Full Ubuntu suite, owner Firefox gap/resize/scroll tests and AI trained-data validation remain outstanding. Next: real observed geometry and verified sample fixtures before extending reflow to new markup or sites.

## Build 291: actual coarse spacing measurements
- The existing on-demand Site Dashboard probe now samples rectangle positions from the already validated video thumbnails **only when the owner opens or rechecks the Pornhub layout section**. It does not run in ordinary mutation scans.
- A same-row gap candidate must have two valid adjacent visible-sized cards with nearly matching top positions. It is considered unusually wide when its CSS-pixel size exceeds 56px **and** 40% of the narrower card's width. The extension reports only counts plus the approximate largest gap rounded to an 8px bucket, never precise positions, tile details, URLs or page text.
- Nesty Layout Scout validates the new optional geometry fields and can recommend trying the existing OFF-by-default compact grid or visually checking a large gap that remains after reflow. These are **suggestions, not AI-authored CSS or new blocking decisions**.
- Normal columns, different rows, overlapping cards, hidden elements, tiny/very large or malformed rectangles and unsupported/mixed lists fail open. Geometry is approximate and may describe intentional website spacing; it does not prove the gap contained advertising.
- No new Settings control was added; local acceptance still requires a real Firefox test of the owner's reported two-video layout, including resize and scrolling.

## Staged integration (one at a time)
- **Build 289 (after owner screenshot/HTML evidence):** inspect the actual Pornhub layout variant with remaining blank space. Add a narrowly verified grid selector or safe margin/padding adjustment only for that variant. Avoid selectors based on a vague `ad` substring.
- **Build 290:** optional per-site controls and a reversible live preview/undo for further verified sites. No general-site auto-reflow without user direction and tests.
- **Build 291:** connect aggregate outcome counters and limited reflow diagnostics with Nesty, but do not let AI/model scores pick arbitrary DOM nodes or CSS.
- **Build 292+:** consider a general page-spacing engine only after multiple distinct sites and negative-control suites, with performance caps and accessibility checks. The earlier planned AI evidence/model/engine-compatibility work remains active, but its provisional build numbers may move.

## Safety and acceptance
- Never move, duplicate, scrape or load videos; use CSS only on existing listing children.
- Never touch video players, forms, chat, contacts, sign-in/payment widgets, accessibility navigation, login popups or other browsers' user interface.
- Preserve site pause, native/advanced cosmetic exceptions, `$document`/`$elemhide`, element-picker and protected site functionality. No telemetry or remote scripts.
- Keep page layout changes off by default while real browser markup is unverified.
- Evaluate initial layout, fast scrolling, infinite feed insertion, different browser window widths, keyboard/focus navigation, links, thumbnails, playback, pause/undo and disabled state.
- Record observed number of videos per row and measured before/after blank gap in owner Firefox; **do not mark this feature confirmed solely because JS tests pass**.
- If the actual DOM is different from `ul.videos > li.videoblock`, fail open instead of guessing. Ask for optional inspector output only after a real test shows no change.
