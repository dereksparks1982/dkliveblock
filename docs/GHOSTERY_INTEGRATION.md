# DK Live Block: Ghostery is included

**End users install the finished Firefox extension once. No additional downloads, terminal commands, npm, Node.js, Ghostery installation, or online build service are required.**

The compiled Ghostery 2.20.3 engine is checked in at `src/ghostery-vendor.js` (479,492 bytes). The manifest loads it before `hybrid-engine.js`. Every normal Firefox package assembled from `src/` includes that script, its interface code, and `src/LICENSE-GHOSTERY.txt`.

SHA-256 for the committed engine:
`ad116ca8d04d716bda3d02e19a35137428b71ae13c6c1f390600830cd8d7e0f9`

Ghostery operates as a supplementary network filtering engine; DK's existing local controls, site-scoped exceptions, privacy protections, video playback safeguards, and Google sign-in protections remain in charge. Ghostery remote executable code, scriptlets, external redirects and uncontrolled resource replacement are not loaded by this integration.

## Developer maintenance only

Developers who intentionally want to regenerate the pinned engine bundle can use the optional script `bash scripts/install-ghostery.sh` on Ubuntu. The compiled result must be reviewed and committed like other source updates. This is **not** an end-user installation step and is not required for ordinary coding or Firefox packaging.

The standalone upstream `@ghostery/adblocker` library is MPL-2.0; keep copyright/source and license notices when distributing. Upstream: https://github.com/ghostery/adblocker . The host app's original code remains MIT-licensed. No npm `node_modules/` tree is bundled or tracked. The extension does not require remote executable code.

## Validation status

Compiled Ghostery library loaded successfully in a local Node.js VM. Offline network blocking and site-scoped exception smoke checks passed. A browser is **not** needed to download dependencies at runtime, but real Firefox playback and comprehensive extension testing are still pending. No public release has been authorized.
