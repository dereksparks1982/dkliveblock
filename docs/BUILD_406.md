# Build 406 / v0.3.366: upstream Ghostery API integration, not another blocker

**November 13, 2026, main only.**

The shipping `src/ghostery-cosmetics.js` bridge uses the approved bundled Ghostery v2.20.3 MPL-2.0 engine. We reviewed upstream engine `getCosmeticsFilters()` internals and the official WebExtension/WebExtension cosmetics examples, and confirmed requesting CSS need not request scriptlet or extended-selector compilation. The previous bridge asked for injection rules but discarded scripts; now it requests CSS directly with `getInjectionRules:false`, retaining the same conservative sanitizer. Also preserve DK-local `$generichide` on the dynamic DOM-backed vendor pass, which previously could hide generic classes on an explicitly protected page.

The upstream WebExtension adapter, if fully enabled, attaches its own request/content listeners, duplicating DK's existing Firefox blocking architecture. We therefore **did not install** it or introduce a second production interception owner. The new offline `scripts/ghostery-compatibility-audit.js` records actual integration status and gaps, leveraging existing `engine-verdict-audit.js` and source dependencies without network or private telemetry. New tests cover request flags, no scriptlet compilation, generichide, exceptions, protected selectors, vendor failures, manifest pin and audit anti-drift. No new permissions or npm package.

Reference source: https://github.com/ghostery/adblocker/blob/master/packages/adblocker/src/engine/engine.ts and https://github.com/ghostery/adblocker/tree/master/packages/adblocker-webextension. Licensed upstream bundle remains unchanged and MPL notices retained. Native Ubuntu/actual Firefox acceptance not performed.
