# Build 411: Conservative scriptlet compatibility and upstream reuse

**DK Live Block · version 0.3.371 · November 14, 2026 · DK Softworks**

**Status:** Existing, explicitly user-authored scriptlet compatibility hardening and **developer-only** Ghostery capability audit. **Not** authorization to execute filter-list scriptlets, import GPL source, alter site allowances, or publish a release.

## Reuse and licensing decision

1. **Reuse the installed engine first.** DK already bundles `@ghostery/adblocker` **2.20.3**, MPL-2.0, in `src/ghostery-vendor.js`. Its documented `FiltersEngine.getCosmeticsFilters` API can return both safe CSS styles and JavaScript scriptlets. The existing production `src/ghostery-cosmetics.js` requests `getInjectionRules:false` and `getExtendedRules:false`. These flags remain unchanged. The new offline-only audit invokes the existing bundled API with injection detection **enabled for measurement only**, and immediately discards script strings. It does **not** evaluate, serialize, store, log, inject or send any upstream script code.
2. **Keep the current user-authored policy.** `src/safe-scriptlet-rules.js` accepts only `set-constant` with six literal values and `abort-on-property-read`, from domain-specific **manual** rules, not automatic list updates. The existing reversible `src/safe-scriptlet-runtime.js` still handles those two operations in the page MAIN world. It does not fetch scripts, execute arbitrary expressions or install browser-wide code.
3. **Do not silently copy GPL code.** AdGuard's [Scriptlets](https://github.com/AdguardTeam/Scriptlets) repository declares GPL-3.0. Its syntax, behavior and test concepts can be considered for compatibility studies, but no AdGuard source or packaged dependency is imported. uBlock Origin's GPL filter/scriptlet resources also remain research references. Any future literal code integration needs a separate explicit license and redistribution decision. Existing Ghostery MPL rights and notices remain intact.

References: [Ghostery upstream FiltersEngine documentation](https://github.com/ghostery/adblocker/blob/master/packages/adblocker/README.md), [Ghostery reference integration](https://github.com/ghostery/adblocker/blob/master/packages/adblocker-electron/src/index.ts), [AdGuard Scriptlets](https://github.com/AdguardTeam/Scriptlets).

## Actual runtime hardening

The prior manual parser could select a leaf property path and one of its descendants together, such as `app.enabled` and `app.enabled.flag`. The existing MAIN-world runtime correctly cannot install both; the second was silently ignored depending on path order. **Build 411 now detects ancestor/descendant collisions in the parser before the established 24-rule budget**, preserving the first eligible user rule, independent sibling paths and all existing exact exceptions. Thus the selected manual rules and actual runtime tree agree. This is a bounded, local change, not more aggressive blocking.

The parser **and** the MAIN-world defensive validator now reject prototype-method and magic-accessor path names, including `toString`, `valueOf`, `hasOwnProperty` and `__defineGetter__`. This prevents manual rules and page-originated events from coercing the helper toward common object internals. Existing protected globals such as `document`, `location`, `fetch`, `localStorage` and `prototype` remain excluded. The two existing literal user operations and restoration behavior are unchanged.

The page-visible `CustomEvent` bridge is **not** a security boundary against scripts running on the same site. Sites can observe their own page and dispatch events. Consequently DK must never accept this bridge as proof of authorization for privileged browser actions, nor use upstream returned JavaScript as a payload. Browser privilege and automatic filtering remain governed by the separate WebExtension background policy.

## Offline comparison and executable acceptance

`scripts/scriptlet-compatibility-audit.js` exercises 16 synthetic `.example` manual-rule fixtures, checks production runtime wiring and Ghostery's current API availability, then emits only aggregate findings. It uses the existing `scripts/engine-verdict-audit.js` loader, **not** another vendored library. It cannot take any external file or URL and reports neither filter lines nor JavaScript bodies. The API probe is never included in the extension's background or content-script manifests.

The added `tests/scriptlet-compatibility-build411.test.js` contains 25 regression cases covering domain scoping, exceptions, collisions, freed rule capacity, protected methods, direct MAIN-world input rejection, reversibility, forbidden operations, vendor result sanitization, malformed input, immutable extension privileges, version pinning and release gates.

On Ubuntu, from the repository root, with **no** installation or network requests:

```bash
npm run audit:scriptlets
node --test tests/scriptlet-compatibility-build411.test.js
npm run test:integration
npm run test:local
```

The offline probe may detect zero usable Ghostery scriptlet resources if resources are not bundled or the fixture does not match an installed resource. That is still useful as a capability gap; it is **not** an excuse to fetch or execute a remote script.

## Explicit decisions / unsupported behaviors

| Capability | Build 411 decision |
| --- | --- |
| Domain-scoped manual `set-constant` | **Retained**, bounded and reversible |
| Domain-scoped manual `abort-on-property-read` | **Retained**, bounded and reversible |
| Manual scriptlet exceptions and per-site pause | **Retained**, existing policy authoritative |
| Ancestor/descendant property conflicts | **New pre-runtime guard** |
| Prototype/magic-object methods | **New parser + runtime denials** |
| Ghostery automatic CSS filtering | **Retained**, script injection disabled |
| Ghostery scriptlets from filter subscriptions | **Offline API presence test only**, never executed |
| AdGuard/uBlock GPL scriptlets | **Research-only**, no code copied |
| Arbitrary JS, remote scripts, eval, fetch replacement | **Not supported** |
| Generic procedural/extended selector engine | **Deferred**, needs separate safety design |
| Signed-in Firefox YouTube/Facebook acceptance | **Pending** |
| Public release | **Not approved** |

## Next milestone

**Build 412:** strengthen dynamic cosmetics and safe page reflow using the already-bundled Ghostery CSS and DK layout scout, with explicit non-ad-content preservation and rollback. Real Firefox positive/negative tests are still needed for the existing signed-in YouTube/Facebook protection paths. No GitHub Actions or user-testing requirement is introduced by Build 411.
