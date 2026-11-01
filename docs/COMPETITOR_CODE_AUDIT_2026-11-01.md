# DK Live Block competitor source-code comparison

**November 1, 2026, Build 203.** Reviewed actual source from DK, uBlock Origin, AdGuard, Adblock Plus and Ghostery. No competing GPL implementation was copied.

| Component | Competitor implementation inspected | DK status | Priority gap |
| --- | --- | --- | --- |
| Static filtering | uBlock Origin static-net-filtering.js compiles typed filters and trie/bidi-trie matchers; ABP matcher.js groups matches; Ghostery has indexed buckets | DK has a smaller partial native parser and bundled Ghostery matcher | Prove rule precedence, optimize throughput, support missing syntax |
| Scriptlets | uBO scriptlet-filtering-core.js compiles domain-scoped, exception-aware scriptlets; AdGuard engine-mv2.ts gates executable rules against prebuilt rules for Firefox AMO | New manual-only site-scoped set-constant rule and fixed local MAIN helper | Wide, vetted automatic scriptlet catalog; multiple primitives; browser review |
| Cosmetic filtering | uBO cosmetic-filtering.js uses selector caches, extended filtering and exceptions | DK native CSS, bounded procedural rules, sanitized Ghostery CSS; now uses validated current page URL | Broader selector support, stronger exception parity |
| Redirect resources | uBO redirect-engine.js and ABP filterClasses.js use bundled local resources | Only noop.js and empty.css | Add tested inert resource types without accepting arbitrary downloads |
| Dynamic filtering | uBO dynamic-net-filtering.js supports block, allow and noop for party/type categories | DK per-site hostname/type control plus exceptions | Third-party matrix, noop control, UI for typed rules |
| Subscription assets | uBO assets.js and AdGuard tswebextension handle cache, policy and updates | DK bundled lists plus guarded refreshes | Incremental list update correctness and feature-level coverage |
| YouTube | Competitors coordinate static, cosmetic, scriptlet rules and maintained assets | DK player JSON rewriting, MAIN bridge, ad tiles, network and skip | Confirm actual ad-free playback, preroll, midroll and film compatibility |

## Exact public source locations
- https://github.com/gorhill/uBlock/blob/master/src/js/static-net-filtering.js
- https://github.com/gorhill/uBlock/blob/master/src/js/scriptlet-filtering-core.js
- https://github.com/gorhill/uBlock/blob/master/src/js/dynamic-net-filtering.js
- https://github.com/gorhill/uBlock/blob/master/src/js/redirect-engine.js
- https://github.com/gorhill/uBlock/blob/master/src/js/cosmetic-filtering.js
- https://github.com/gorhill/uBlock/blob/master/src/js/assets.js
- https://github.com/AdguardTeam/AdguardBrowserExtension/blob/master/Extension/src/background/engine/engine-mv2.ts
- https://github.com/adblockplus/adblockpluscore/blob/master/lib/matcher.js
- https://github.com/adblockplus/adblockpluscore/blob/master/lib/filterClasses.js
- https://github.com/ghostery/adblocker/blob/master/packages/adblocker/src/engine/engine.ts

## Security and compatibility decision
The new active rule is deliberately limited to a manually entered example such as:

    news.example##+js(set-constant, adblockDetected, false)

Site exception:

    news.example#@#+js()

Only six literal values are accepted. Automatic subscription lists do not activate scriptlets, and the bundled Ghostery script output is still ignored. No remote script may be fetched or evaluated. Properties associated with browser security APIs, prototype mutations and global web APIs are rejected. The fixed module alters page variables only at the owner's manual direction and attempts to restore them on disable. In Firefox the extension passes only serialized JSON across its isolation boundary.

## Verification outstanding
This is source-level architecture comparison, not measured coverage or an independent browser benchmark. Test the entire seven-phase Ubuntu suite, run Firefox behavior with and without competitors separately, and verify ordinary video, prerolls, midrolls and ad-funded movies. Do not claim uBO/ABP parity or release readiness.
