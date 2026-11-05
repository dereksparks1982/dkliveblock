# Build 392 / v0.3.352: hardened Ghostery cosmetic interoperability

**November 4, 2026. Development only.**

The project already bundles Ghostery's proven MPL-2.0 engine. DK does **not** replace it with new homegrown network code, and does not copy GPL-based third-party executable scriptlets. This build improves the supplementary Ghostery CSS bridge.

The previous comma-based string split corrupted valid filters with quoted attribute commas, e.g. `.sponsor[data-kind="promo,slot"]`. The new finite-state bounded splitter retains quoted commas, refuses malformed brackets/quotes/escapes, and passes each output through the existing protected-tag, CSS-declaration and owner-exception gates.

Commercial redistribution requires retaining Ghostery's MPL notices/source rights and the independently licensed Facebook MIT file. DK's custom free-use restrictions apply only to its own covered contributions and cannot override upstream permissions.

No UI geometry, stored preferences, extension permission or network-filter policy was changed. Full Ubuntu and live Firefox verification are still pending, as is a public release.
