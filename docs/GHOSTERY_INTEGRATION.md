# DK Live Block: Ghostery is included

**End users install the finished Firefox extension once. No additional downloads, terminal commands, npm, Node.js, Ghostery installation, or online build service are required.**

The compiled Ghostery 2.20.3 engine is checked in at `src/ghostery-vendor.js` (479,492 bytes). The manifest loads it before `hybrid-engine.js`. Every normal Firefox package assembled from `src/` includes that script, its interface code, and `src/LICENSE-GHOSTERY.txt`.

SHA-256 for the committed engine:
`ad116ca8d04d716bda3d02e19a35137428b71ae13c6c1f390600830cd8d7e0f9`

Ghostery operates as a supplementary network filtering engine; DK's existing local controls, site-scoped exceptions, privacy protections, video playback safeguards, and Google sign-in protections remain in charge. Ghostery remote executable code, scriptlets, external redirects and uncontrolled resource replacement are not loaded by this integration.

## Developer maintenance only

Developers who intentionally want to regenerate the pinned engine bundle can use the optional script `bash scripts/install-ghostery.sh` on Ubuntu. The compiled result must be reviewed and committed like other source updates. This is **not** an end-user installation step and is not required for ordinary coding or Firefox packaging.

The standalone upstream `@ghostery/adblocker` library is MPL-2.0; preserve its source availability, notices and license rights when distributing. Upstream: https://github.com/ghostery/adblocker . DK's own source is subject to the project's separately stated license, not automatically MIT; the Facebook MIT reference remains independently MIT-licensed. No npm `node_modules/` tree is bundled or tracked. The extension does not require remote executable code.

## Validation status

Compiled Ghostery library loaded successfully in a local Node.js VM. Offline network blocking and site-scoped exception smoke checks passed. A browser is **not** needed to download dependencies at runtime, but real Firefox playback and comprehensive extension testing are still pending. No public release has been authorized.

## Build 392 hardened CSS integration

The existing MPL-2.0 Ghostery engine is reused, not duplicated. Its supplementary CSS output now splits selector lists only at genuine top-level commas; quoted commas inside attribute selector values are preserved. Unclosed quotes, malformed brackets, CSS escapes, nested groups and arbitrary injected declarations fail closed. Scriptlets and external redirects remain excluded. The original upstream bundle is not modified and keeps its own license.

## Build 393 WebRequest resource-type compatibility

Firefox's `imageset` and `beacon` request types are normalized at the Ghostery bridge boundary to the `image` and `ping` filter families documented by the upstream matcher. The original Firefox types remain visible to DK's native engine and existing request controls. Unknown/new types are not guessed, and host/page policy, manual rules, important exceptions and streaming guards retain precedence. Upstream Ghostery remains bundled and MPL-2.0.

## Build 397 aggregate workload cap

The licensed Ghostery cosmetic bridge now processes no more than 2,000,000 characters and 4,000 CSS declaration blocks across its bounded vendor fragments, in addition to the existing per-fragment, fragment-count and selector limits. Earlier validated CSS rules are retained and later blocks omitted if the budget is exceeded. This avoids excessive parsing from a large malicious or unexpected list. No scriptlet execution, new vendor engine or page exception change is introduced.

## Build 401 DOM-aware cosmetic matching

Ghostery's existing MPL-2.0 `getCosmeticsFilters` API has a second, DOM-specific path accepting class and ID names. DK previously used only hostname/base rules. The new `ghostery-dom.js` sampler collects at most 64 safe class names and 32 IDs (up to 360 initial nodes, 40 mutation records and 16 nodes in each new subtree). It reads **no page text, URLs, link destinations, login fields or form values**. Its bounded sample travels only between the content script and local extension background through the existing `getStyle` interface, where it is normalized again. The Ghostery vendor receives an empty href list, never raw pages or DOM nodes.

The bridge asks the upstream engine for `getRulesFromDOM:true` with base/hostname/injection disabled for this incremental pass. Returned CSS joins baseline CSS and is subject to the exact existing safe-selector, media, authentication and user-exception rules. Upstream scripts are discarded. Ordinary pages are eligible; Facebook's full MIT module and known streaming hosts stay excluded until owner browser verification. No new permissions, dependencies, remote scripts, observers or UI changes were made.
