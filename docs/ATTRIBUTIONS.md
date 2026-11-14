# Third-party attributions: DK Live Block

The DK Live Block project credits external media, code and rule-list authors here. These components retain their original licenses. DK LAB's [project license](../LICENSE) covers DK-owned contributions, not the third-party materials listed below.

## Audio: Button Press by DRAGON-STUDIO

- **Title:** Button Press.
- **Creator:** DRAGON-STUDIO.
- **Original Pixabay page:** https://pixabay.com/sound-effects/film-special-effects-button-press-382713/
- **Local audio file:** `assets/sound/dragon-studio-button-press-382713.mp3`.
- **License:** Pixabay Content License: https://pixabay.com/service/license-summary/
- **Use:** A short, optional button-click sound on the public DK Live Block website's educational cards and other visible buttons. Served from DK Live Block's own GitHub Pages asset URL. No Pixabay request is made by a click.
- **Attribution:** “Button Press” by DRAGON-STUDIO via Pixabay. Credit is optional under Pixabay terms but appreciated by the creator; we credit them here.
- **Redistribution caveat:** The Pixabay Content License places restrictions on selling/distributing unmodified media on a standalone basis. This asset is not relicensed by Elderred Softworks under the DK Live Block source license.

## Code and data

- **Ghostery-based filtering:** MPL 2.0; see [src/LICENSE-GHOSTERY.txt](../src/LICENSE-GHOSTERY.txt).
- **Mozilla Public Suffix List:** MPL 2.0; see [src/LICENSE-PSL.txt](../src/LICENSE-PSL.txt).
- **Vendored Facebook Sponsored reference:** MIT; see [src/vendor/LICENSE-FACEBOOK-SPONSORED-MIT.txt](../src/vendor/LICENSE-FACEBOOK-SPONSORED-MIT.txt). The complete adapted MIT engine is active at `src/facebook-full-core.js` on Facebook alone, replacing the former partial DK Facebook scanner. The original reference and license remain preserved.
- **Rule-list subscriptions:** Maintain the license, authorship and source notices applicable to each external filter list.

Before incorporating other third-party sounds or imagery, document their authors, original sources, local paths and licensing here.

## Facebook advertising response-schema reference

- **uBlock Origin uAssets:** https://github.com/uBlockOrigin/uAssets/blob/master/filters/filters.txt
- **Purpose:** Publicly documented Facebook GraphQL ad markers and compatibility cautions informed independent DK Live Block schema matching. No uBlock Origin source code or scriptlet runtime was copied into DK's new GraphQL response module. The upstream repository and filter-list authorship remain with their original owners.

## Build 394 provenance gate

The offline `npm run audit:licenses` gate verifies the already bundled Ghostery/MPL, Mozilla PSL/MPL and Facebook/MIT source/license pairs, checked-in Ghostery hash, pinned dependency versions and manifest wiring. Unknown new dependencies require a separate licensing review. This is not legal advice or exhaustive transitive dependency/filter-list clearance. Third-party rights and source-availability obligations remain independent of DK's custom source license.

## Build 405: potential upstream sources are not new bundled licenses

The [open-source integration roadmap](OPEN_SOURCE_INTEGRATION_ROADMAP.md) catalogs additional *candidate* GitHub repositories, current high-level license indicators and proposed work. None of those candidates was installed, vendored into the runtime or relicensed in Build 405. The existing Ghostery MPL-2.0, Mozilla PSL MPL-2.0, Facebook MIT and offline micrograd MIT notices remain authoritative. A future actual integration must extend these attribution and license files at the same time code is introduced.

## Build 409 optional developer-only Brave research

The optional Cargo experiment at `experiments/brave-differential/` **references** Brave's [adblock-rust](https://github.com/brave/adblock-rust) 0.13.5 through its official Rust crate API. Brave source is licensed **MPL-2.0**. No Brave source or binary was copied into the Firefox runtime, vendored into DK, or installed on end-user devices in this build. The crate is not part of the root npm dependencies. The developer who chooses to resolve/build the optional Cargo project must review its resulting lockfile, exact sources, license notices and redistribution obligations before shipping any artifact. Safari-converted rules are derived from synthetic DK examples, not from copyrighted external lists. The complete capability and acceptance discussion is at [Build 409](BRAVE_SAFARI_PORTABILITY_BUILD409.md).

## Build 410 Nesty synthetic holdout experiment

No new third-party ML package, data set, weights or model was imported. The evaluation code at `scripts/nesty-holdout-evaluator.js` reuses DK's existing offline synthetic `src/adaptive-model.js` and Build 295 benchmark library. The existing MIT micrograd provenance remains at `scripts/vendor/micrograd/LICENSE`. The `mljs/ml` GitHub project was considered but **not installed or copied**; the privacy and real-labeled-data acceptance gate must be met before adopting it. The 60 fixture examples are newly self-authored synthetic cases, not captured browser data. See [Nesty Build 410](NESTY_EVALUATION_BUILD410.md).

## Build 411: Ghostery scriptlet API research and AdGuard GPL boundary

The optional offline-only scriptlet capability audit at `scripts/scriptlet-compatibility-audit.js` calls the **already bundled** Ghostery 2.20.3 API, published under **MPL-2.0**, against synthetic `.example` rules. Any executable script text returned by the upstream library is discarded immediately; no new source, binary, list-supplied JavaScript, or third-party data is installed or executed. Production Ghostery cosmetics continue to pass `getInjectionRules:false`. Changes to the user-authored DK parser and runtime are original DK-owned compatibility guards, not copied scriptlets.

[AdGuard's Scriptlets](https://github.com/AdguardTeam/Scriptlets) are **GPL-3.0**; the repository was reviewed as a capability/syntax reference only. No GPL code, package, scriptlet, runtime or filter list was copied or vendored into DK Live Block. The same applies to uBlock Origin GPL scriptlet sources. Future direct code reuse needs an explicit licensing/distribution decision and source/attribution review; repository availability is not blanket permission to relicense. See the [Build 411 decision ledger](SCRIPTLET_COMPATIBILITY_BUILD411.md).
