# DK Live Block: open-source ad-blocker engine research

Research date: 2026-10-31. Baseline: DK Live Block unreleased v0.3.35, Build 65.
Status: investigation only, not a YouTube fix. No third-party source files, filters or snippets were copied into this repository.

## Field symptoms and evidence

The YouTube investigation has shown an anti-adblock wall, black video after hiding the wall, and sporadic playback with a sponsored pre-roll visible. These are all FAILURES of the combined acceptance requirement: playback must work while advertisements are genuinely absent.

The user's 2026-10-31 blocked-request JSON reported 19 blocked events, including repeated first-party www.youtube.com XMLHTTPRequest events handled by the native filter engine, but omitted the private matched URL rule text. It also showed DoubleClick/Googlesyndication blocks, one Google image and a first-party YouTube image block, no blocked media-type requests, and no recorded playback diagnostics. The report cannot prove which request caused the player refusal. Blanket blocking or exempting youtube.com and googlevideo.com would be unjustified.

## Public repositories and methods

1. uBlock Origin engine: https://github.com/gorhill/uBlock . uAssets filters: https://github.com/uBlockOrigin/uAssets . Current delivery: https://github.com/uBlockOrigin/uAssetsCDN/blob/main/filters/filters.txt and https://github.com/uBlockOrigin/uAssetsCDN/blob/main/filters/quick-fixes.txt . The inspected uBO filters snapshot was updated October 26, 2026 and includes YouTube-specific first-party ad data handling: selected response transformations, fetch/XHR scriptlets, JSON pruning targeting fields like adPlacements and adSlots, and targeted exceptions. uAssets manages video ads, anti-blocker measures, and website unbreak fixes. Not a guarantee that any individual YouTube account is covered. GPL-3.0 license; do not directly copy into our MIT source.

2. Ghostery library: https://github.com/ghostery/adblocker and https://github.com/ghostery/adblocker/blob/master/packages/adblocker/README.md . Its filter engine exposes getCosmeticsFilters(), which supplies styles and scripts, as well as network matching and redirect facilities. MPL-2.0 source. DK already bundles the pinned v2.20.3 engine in src/ghostery-vendor.js. It contains getCosmeticsFilters, but our src/hybrid-engine.js currently calls only vendor.match() for network requests, explicitly rejecting vendor redirects or rewrite outcomes. This is the highest-value existing local capability gap.

3. AdGuard extension: https://github.com/AdguardTeam/AdguardBrowserExtension ; scriptlets https://github.com/AdguardTeam/Scriptlets . Implements declarative JS scriptlets, local redirect resources, extended filters and website-specific support. GPL-3.0, so use design ideas only unless licensing compatibility is reviewed.

4. Adblock Plus: https://github.com/adblockplus/adblockplus ; anti-circumvention https://github.com/abp-filters/abp-filters-anti-cv . Uses extra anti-circumvention lists, snippets and substitutes for blocked resources. Official help https://help.adblockplus.org/adblock-plus-help-center/what-to-do-if-you-are-seeing-youtube-s-anti-adblocking-warning says ABP may temporarily AUTOMATICALLY PAUSE its blocker when YouTube detects it. That is not the intended DK ad-free behavior. GPL-3.0-covered works: review licensing before reusing code or filters.

5. Brave filtering engine: https://github.com/brave/adblock-rust . Rust/WASM, efficient matchers, replacements, uBlock-compatible rules and scripting infrastructure; MPL-2.0. Architectural reference, not needed as a second dependency.

6. Firefox MV2 response stream API: https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/webRequest/filterResponseData . Possible with existing webRequest and webRequestBlocking permissions. A stream filter MUST be properly written and closed/disconnected, otherwise network responses can hang. Do not touch media streams or large/unknown payloads.

## Our source-code gap

- src/hybrid-engine.js: network matcher only; ignores Ghostery scripts, redirects and response rewrites. Existing vendor bundle has scriptlet/cosmetic support that is not currently wired into our extension.
- src/youtube-maintenance.js: intentionally restricts the YouTube compatibility pack to simple ad-labelled CSS selectors. Advanced rules and scriptlets are rejected. It cannot remove advertisement metadata from first-party player responses.
- src/content.js: page-side CSS and dialogs are handled, but not page-context player response data. A Firefox content script in an isolated extension world is not automatically a page-script replacement.
- src/background.js: request cancellation and coarse hostname-only diagnostics are implemented. The export does not safely identify which actual first-party filter list/rule caused repeated YouTube XHR cancels.
- Our current 0 blocked indicator on allowlisted sites should not be confused with zero network activity; separate permitted activity counting exists, with TXT/JSON export still requested.

## Staged build recommendations

A. First, improve safe source attribution of first-party blocked requests (rule/list identifier without exposing URL path, video ID, credentials), audit other enabled blockers, capture filter revision, and add an exportable playback-health/allowed-network picture. Add fixtures for 13 repeated first-party blocked XHRs without assuming their purpose.

B. Add a constrained local scriptlet dispatcher using the already bundled Ghostery capabilities. Allow only locally reviewed code, trusted host-scoped rules, explicitly handled Firefox page-context injection and safe behavior under CSP restrictions. Never execute arbitrary downloaded JavaScript, custom filter scripts without validation or nonlocal runtime dependencies.

C. In a separate experimental, default-off stage, prototype bounded YouTube player-response advertising-metadata handling for specifically validated JSON responses (not raw video bytes, DRM or signed media). Fail open on oversized or unknown schemas, fragments, malformed response and site changes. Preserve playback-related fields and avoid interfering with login or OAuth. Demonstrate normal video playback with zero ads and no anti-block warning before enabling by default.

D. Add supported local resource replacements and exceptions only after licensing, test fixture and compatibility validation. No broad domain disable, no acceptable ads, and no silent pausing.

E. Test separately: signed-in and signed-out YouTube where feasible; short and long videos, ad-funded movies, Shorts, playlists, seeking, navigation, player reload, repeated plays and other popular sites. Measure playback, ads, enforcement, broken UI, performance and privacy. A hidden warning with a black player remains a failure.

## License issue requiring owner decision

Current top-level DK repository LICENSE is MIT, expressly allowing resale and other commercial reuse, contrary to the owner's previously stated wish for noncommercial-only reuse. Do not change it automatically: the owner must decide licensing. uBlock Origin/uAssets, AdGuard and ABP include GPL-3.0 materials and GPL code cannot simply be relicensed with extra no-commercial conditions. Ghostery's bundled MPL-2.0 source requires proper licensing and source-file obligations. Borrow concepts and write independently compatible code instead of copying incompatible third-party code.

## Result

This commit records research only. It changes no extension functionality, invokes no GitHub Actions, adds no runtime dependency, and does not claim the YouTube issue is solved.
