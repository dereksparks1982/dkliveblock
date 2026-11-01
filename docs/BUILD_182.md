# Build 182: vetted literal `:matches-css()` procedural cosmetic support

**Unreleased:** 0.3.152 (2026-11-01).

## Comparison-derived gap
uBlock Origin supports computed-style procedural predicates including `:matches-css()`. DK had bounded literal text, descendant and attribute predicates, but rejected computed-style matching entirely. This meant compatible filter-list cosmetic rules could not hide overlay ads styled with fixed positioning or high z-index.

## Independently authored implementation
- Add a **host-scoped, exact-literal subset** of `:matches-css(property:value)` for five simple computed CSS properties: `position`, `display`, `visibility`, `opacity`, and `z-index`.
- Parse these into `mode:"css"` procedural records; enforce a short, strict allowlist of property values, reject regular expressions, remote URLs, arbitrary properties and executable syntax. Generic/global rules remain unsupported.
- The procedural engine reads `getComputedStyle(element).getPropertyValue(property)` from the element's own document view. It performs a case-normalized exact comparison only, without changing the style or invoking arbitrary rule-supplied code.
- Reuse the extension's existing bounded per-site scan and **reversible cosmetic hide** path, with authentication/identity and streaming-player element protection. No element is removed or detached.
- Update selector deduplication and exception handling to include the CSS property/value pair, so two distinct predicates on one selector remain separate and `#@#` exceptions cancel only exact matching rules.
- No new WebExtension permissions, downloaded executable resources, UI geometry changes, external dependencies or GitHub Actions.

## Verification and caveats
- Ran the actual modified `rules.js`, `engine.js` and `procedural.js` together in a synthetic V8 harness: 12 checks passed, including scoped selectors, exceptions, deliberate duplicate suppression, style matches and rejection of unsupported regex/global rules.
- Added parser, matcher, hostile-page, exception and filter-audit regression fixtures.
- **Not tested:** real computed-style performance in Firefox, complete seven-phase Node/Python gate, YouTube streaming or ad removal, and broader uBlock/AdGuard parity.
- This is a safe subset only, **not** general `:matches-css()` regex and style-based selector parity. It does not by itself fix ordinary YouTube video ads.

**Next Build 183:** continue verified network/extended-cosmetic coverage and add regression fixtures that compare real downloaded-list behavior. Do not publish until full browser acceptance.
