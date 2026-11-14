# DK Live Block: reuse-first open-source integration program

**Build 405 / version 0.3.365 · November 13, 2026 · DK Softworks**
**Repository:** [dereksparks1982/dkliveblock](https://github.com/dereksparks1982/dkliveblock)
**Status:** approved planning and offline development tooling, **not** authorization for automatic third-party code imports, production adoption or a public release.

## Goal and operating policy

**Reuse proven, properly licensed open-source implementations before writing another engine or detector.** DK-owned software should primarily implement the integration, browser-policy boundaries, permissions, safe exception precedence, specific unserved capabilities, interface and acceptance tests. Existing source may not be copied wholesale merely because it is public on GitHub. Study upstream extension integration patterns and APIs first; upgrade/wire the installed Ghostery engine before introducing more engines.

- One branch, `main`, and one build at a time. No PRs or surprise releases. README stays user-facing.
- Do not replace the known-good YouTube/Disney+ paths, the approved English/Russian artwork or the complete MIT Facebook DOM detector without demonstrated improvements and regression tests.
- No extra end-user installation, runtime downloads, remote executable scripts, browsing telemetry or broad page-world scriptlet import.
- Evaluate licensing **per artifact, pinned version and redistribution mechanism**. DK's no-resale original license does not supersede GPL, MPL, MIT or dataset notices. Ask for an explicit distribution/licensing decision before integrating GPL source.
- Keep page-level allowances, user exceptions, authentication, messaging, Marketplace listing creation, accessibility and media player safety authoritative.
- Always differentiate: installed runtime, vendored developer-only tool, planned offline evaluation, research-only, deferred, archived.

## Current reusable foundation, confirmed in DK repository

| Component | Exact DK evidence | Current use | Remaining gap |
| --- | --- | --- | --- |
| Ghostery Adblocker 2.20.3, MPL-2.0 | `src/ghostery-vendor.js`, `src/hybrid-engine.js`, `src/ghostery-cosmetics.js`, `src/ghostery-dom.js` | Bundled network matching, exceptions, audited inert redirects, baseline and dynamic DOM CSS | Upstream rule and page policy compatibility; optional official webextension adapter comparison; native-vendor differential benchmarks |
| Mozilla Public Suffix List, MPL-2.0 | `src/public-suffix.js`, `vendor/public_suffix_list.dat`, `src/LICENSE-PSL.txt` | Domain/PSL decisions | Canonical update provenance, freshness and reproducibility |
| Inky Facebook Sponsored reference, MIT | `src/facebook-full-core.js`, `src/vendor/facebook-sponsored-upstream.js`, MIT notice | Complete adapted Facebook DOM scanner, linked-label recovery and safety checks | Signed-in scrolling/organic-post/browser testing, GraphQL/DOM diagnostics |
| micrograd, MIT | `scripts/vendor/micrograd/` and MIT notice | Offline training experiment provenance | No live AI detection; real verified labeled data needed before ML claims |
| DK first-party Meta GraphQL engine | `src/meta-graphql.js` | Scoped `sponsored_data`, `th_dat_spo`, typed strategy and feed nodes/edges rewriting | Actual Facebook response schema acceptance; no GPL scriptlets copied |

**Important:** `scripts/engine-verdict-audit.js` already compares the *actual bundled native, Ghostery and hybrid* engines offline. Build 405 **extends that existing harness** instead of inventing a second one. Its results are synthetic diagnostics, not live adblock reliability.

## Upstream reuse decisions (GitHub repository metadata checked November 13, 2026)

| Upstream | Reported repository license/status | Priority | Approved path and limits |
| --- | --- | --- | --- |
| [ghostery/adblocker](https://github.com/ghostery/adblocker) | MPL-2.0, active | P0 | Finish using installed engine; inspect supported official WebExtension wiring/API; review exact version before upgrading |
| [brave/adblock-rust](https://github.com/brave/adblock-rust) | MPL-2.0, active | P1 | Standalone **offline** differential runner; separately evaluate Safari content-blocker conversion for Orion; no second Firefox runtime engine by default |
| [mljs/ml](https://github.com/mljs/ml) | MIT, active | P1 | Offline Nesty evaluation with labeled holdout data; ship nothing that causes automatic hiding from an uncalibrated score |
| [microsoft/onnxruntime](https://github.com/microsoft/onnxruntime) | MIT, active | P3 | Optional bundled WASM pilot only if a measured trained model warrants memory/CSP/CPU cost |
| [huggingface/transformers.js](https://github.com/huggingface/transformers.js) | Apache-2.0 **code**, active | P3 | Defer; model weights have independent licenses/size/battery constraints |
| [AdguardTeam/Scriptlets](https://github.com/AdguardTeam/Scriptlets) | GPL-3.0, active | P1 research | Compare capabilities and license options; no code copying to custom-restricted DK distribution |
| [AdguardTeam/AdGuardExtra](https://github.com/AdguardTeam/AdGuardExtra) | No reliable repo-level SPDX result | P2 research | Per-file license and API review required; do not silently vendor userscripts |
| [AdguardTeam/tsurlfilter](https://github.com/AdguardTeam/tsurlfilter) | GPL-3.0, active | P2 research | Rule-parser and MV3 benchmark concepts only pending license decision |
| [uBlockOrigin/uAssets](https://github.com/uBlockOrigin/uAssets) | GPL-3.0, active | P1 research | Regression examples and documented Facebook/YouTube breakage. No GPL filters or runtime transplantation |
| [EFForg/privacybadger](https://github.com/EFForg/privacybadger) | No definitive repository SPDX; audit of per-file GPL-family terms required | P2 research | Consider false-positive/owner inference methodology without GPL code import |
| [duckduckgo/tracker-radar](https://github.com/duckduckgo/tracker-radar) | Dataset license, not reliably identified by repository SPDX | P2 research | Ownership/provider intelligence validation only. Confirm dataset CC terms, attribution, noncommercial and share-alike rights |
| [duckduckgo/privacy-configuration](https://github.com/duckduckgo/privacy-configuration) | Data/config licensing requires specific review | P2 research | Use for exception methodology, not wholesale importing datasets into DK |
| [abp-filters/abp-filters-anti-cv](https://github.com/abp-filters/abp-filters-anti-cv) | GPL-3.0; **archived** at November 13 checkpoint | P3 historic | Keep as historical anti-reinsertion reference; don't build a live dependency on abandoned updates |

Repository-level GitHub license metadata is **not legal clearance** and may not cover particular datasets, weights, assets, transitive packages, or modified sources. Check the exact files and versions at each proposed adoption.

## Planned builds, in priority/dependency order

| Build | Deliverable | Reuse source | Complete when |
| --- | --- | --- | --- |
| **405 COMPLETE (code and docs)** | Living inventory, upstream status and licensing decisions, actual DK/Ghostery differential fixture expansion, offline integration gate and scripts | Existing Ghostery, PSL, MIT Facebook, engine-verdict audit and license gate | Source evidence and synthetic tests pass, roadmap and provenance documented; no browser outcome claim |
| **406 P0** | Ghostery compatibility gap report: official WebExtension approach vs DK bridge; rule families, exception/important, badfilter, CSP, resources, cosmetic and policy precedence | Ghostery | Differential table + unit/regression suite; explicit reuse/unsupported decisions; no new live engine |
| **407 P0** | Facebook linked delivery pipeline diagnostic: MIT DOM ↔ first-party GraphQL ↔ read-only Nesty Meta evidence, late SPA arrivals and miss categories | MIT Facebook + Ghostery where safe | Exact tab, no private-content export, positive and protected-organic fixtures, reversible mode |
| **408 P0** | YouTube refusal and stream-safe compatibility work, preserving known-good source tag and no reload loops | Existing bundled engine and player adapters | No playback regression, verified real refusal diagnostics, Firefox acceptance needed before claims |
| **409 P1** | Brave offline differential comparison and Apple/Safari content-blocker conversion proof of concept | Brave adblock-rust | Developer-only artifact, license and output accuracy verified; unsupported Orion API capabilities explicit |
| **410 P1** | Nesty supervised *offline* candidate evaluation | mljs/ml + existing synthetic model | Source-approved real labeled samples, train/test split by site, FPR/precision/recall, deterministic versioning and rollback |
| **411 P1** | Scriptlet and anti-circumvention capability/license decision | Ghostery built-in support first, AdGuard/uBO as reference | Reviewed allowlisted behavior, exception and security tests; GPL code import only after an approved license/distribution change |
| **412 P1** | Dynamic cosmetics and safe page reflow improvements, with non-ad-content restoration | Existing Ghostery + DK layout scout | No media/login/navigation breakage and owner-observed before/after examples |
| **413 P2** | Provider/tracker evidence and breakage exception research | Privacy Badger and DuckDuckGo sources as research | Verified ownership, aging/uncertainty, legal dataset clearance if importing, no blanket hostname blocks |
| **414 P2** | Browser adapter portability: Firefox MV2, Chromium MV3/Yandex, Orion/Safari feasibility | Brave converter and existing DK browser-compat | Capability table, actual supported APIs, separate artifacts and owner acceptance |
| **415 P2** | Full Ubuntu test/license/release readiness, final site verification ledger | Existing offline gates and vetted upstream tools | All local suites pass, no unreviewed dependencies, real-browser coverage; release only with owner authorization |
| **416 P3** | Optional ML runtime proof of concept if previous ML evidence warrants | ONNX Runtime or Transformers.js | Measured benefit over light classifier, model licensing, offline bundle size, battery and CSP constraints |

Build numbers can be amended in the roadmap as real upstream constraints emerge, but never relabel existing completed builds.

## Executable checks and acceptance

Run from the repository root on Ubuntu (no network, no sudo, no interaction):

```bash
npm run audit:reuse
npm run audit:engine-compat
npm run test:integration
npm run test:local
```

- `audit:reuse` checks the installed component evidence, reviewed dependencies/license gates, manifest load order and reuses the existing bounded native/Ghostery comparison corpus. It emits **only aggregate synthetic results**, no browsing content, user URLs or requests.
- `audit:engine-compat` reuses the established differential harness for exact synthetic filter behaviors. Mismatch is a research item, not authorization to change active blocking.
- Synthetic tests prove only source behavior. Require real Firefox positive/negative acceptance on Facebook feed, search, Marketplace editor, YouTube ordinary and Free-with-Ads videos, Disney+ playback, Pornhub grid, popup sites and login/checkouts.
- No automatic model training on user browsing; no cloud telemetry, unreviewed code execution or site-wide blocking based on weak evidence.
- Keep source hashes, version pins and upstream notices together. When new third-party code really ships, add it to `docs/ATTRIBUTIONS.md`, license gate, source availability pack and Firefox packaging preflight.

## Decision gate before each new custom module

1. Does Ghostery/another **already shipped** component provide an appropriate supported API?
2. Does an actively maintained upstream library cover the requirement under compatible, file-verified redistribution terms?
3. Can we integrate it via a bounded adapter without a second conflicting decision owner, permissions or remote code?
4. Are there genuine positive and negative cases including protected content, media, privacy and revert behavior?
5. If no, document why a narrow DK implementation is necessary. Do not default to starting over.

## Build 406 milestone result (November 13, 2026)

Completed a source-backed upstream Ghostery API comparison and corrected DK's existing CSS-only bridge to request `getInjectionRules:false`. This is an actual runtime integration improvement, **not** an additional adblock engine. Dynamic generic hiding now defers to the DK page's `generichide` exception. Added `npm run audit:ghostery-compat` documenting linked versus intentionally disabled engine features (CSP, advanced selectors, scriptlets, HTML rewriting, serialization and official WebExtension adapter). The official WebExtension package is retained as a future adapter comparison, not installed as a competing listener. Build 407 Facebook diagnostics is next; complete Ubuntu/browser acceptance remains pending.

## Build 407 milestone result (November 13, 2026)

Reused **existing** MIT Facebook full-core diagnostics, Nesty Meta 05 GraphQL stats and `DKFacebookDiagnosticReport`, rather than building another Facebook hiding engine or copying GPL scriptlets. The fixed-schema user-requested report now includes a frozen five-field `pipeline` aggregate classification of both layers, including no eligible response, known unchanged responses, parser/timeout fallback, delayed SPA label retries and unanchored posts. The exported report never includes post contents, account data, cookies or URLs. The counters are not correlated to a particular feed post, so no success conclusion follows from them. This is a diagnostic foundation, not live Facebook adblocking confirmation. Next: Build 408 preserve existing YouTube safeguards while diagnosing ordinary-video refusal.

## Build 408 milestone result (November 13, 2026)

The existing YouTube first-party JSON filter, MAIN-world bridge and feed helper now treat a structured `playabilityStatus.errorScreen` as refusal evidence even with a misleading `status: "OK"`. They preserve the entire response rather than strip ad fields from an error screen. Ordinary playable responses continue through the existing filter. This is a playback-safety compatibility improvement, **not** a claimed anti-adblock bypass or automatic reload. Full Ubuntu and real Firefox verification remain pending. Next is Build 409's offline Brave engine evaluation and Orion/Safari capability study.
