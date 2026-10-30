# Build 49: opt-in cosmetic filter debugger

**Version 0.3.20 · UNRELEASED source.**

- Firefox toolbar includes **Inspect element-hiding filters**, opening a bundled inspector page bound to the selected tab ID.
- The background confirms a live, active-protection HTTP(S) tab and computes only already-sanitized cosmetic selectors. Page content scripts cannot request the rule inventory directly.
- The inspector sends only the verified source-site hostname and at most 80 selectors to the selected tab. A manual Scan reports match counts and unsupported selectors, without reading text content, form values, identities or page URL paths.
- A manual Outline action adds temporary `outline` and `outline-offset` to at most 12 **visible** matched nodes. It never changes `display`, `visibility`, `opacity`, click handlers or filtering rules. Exact pre-existing inline outline styles are restored on Clear, page refresh, protection pause or inspector page close. Elements already hidden stay hidden.
- Output safely uses `textContent`, not arbitrary HTML. Unknown/invalid CSS selectors are skipped or marked unsupported.

**Limitations:** The first 80 eligible selectors only; no DOM shadow-root traversal, source-list attribution or individual cosmetic rule disabling. Browser manual testing and full Node/Python regression still pending. No GitHub Actions, packaged build, or public release.
