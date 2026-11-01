# Build 159: consistent site-level cosmetic filter exceptions

**Unreleased 0.3.129, October 31, 2026**

**Defect:** A site using an explicit native filter exception `@@||site.example^$elemhide` received no native element-hiding CSS but could still receive the Ghostery vendor CSS appended by `background.js`. This violated user-selected website exceptions and could break legitimate controls. Similarly `$generichide` inhibited native generic CSS but Ghostery's base CSS remained enabled.

**Fix:** `DKGhosteryCosmetics.styles()` now accepts the existing page `policy`. It emits no CSS if `document` or `elemhide` is set. For `generichide`, it requests `getBaseRules:false` from Ghostery, leaving hostname-specific stylesheet matching active. `background.js` sends that policy to the CSS helper. All other existing filters, authentication/player selector guards, scriptlet prohibition, and site-specific permissions remain unchanged.

Regression tests exercise direct helper behavior, vendor call arguments, actual bundled Ghostery engine policy semantics, and JS syntax. No CI or GitHub Actions used; targeted source smoke is not the full suite or live browser acceptance. No public release.
