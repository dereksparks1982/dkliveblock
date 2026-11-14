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
