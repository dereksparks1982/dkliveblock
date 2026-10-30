# Build 48: optional regional language filters

**Version 0.3.19 · UNRELEASED.**

- Six curated supplementary filter lists for Arabic, Turkish, Russian, French, German and Chinese sites. All start **disabled**, distinct from the five core default-on protection lists.
- Each regional subscription uses existing HTTPS-only data downloads, 20 MB per-list cap, conditional cache, safe text parsing, individual Update and user-selected enable/disable controls.
- A user-clicked button compares `navigator.languages` against the curated catalog locally, recommends up to four entries and requests their downloads. Arabic locale also selects Liste FR because Liste AR is published as a supplement to it.
- No remote language detection, automatic first-run regional downloads, language preference upload, extensions, paid exemptions or promotional messages.
- Note: disabled or not-yet-downloaded lists do not add filter rules. Additional lists may slow filtering or require extra memory.

**Outstanding:** independently download and validate each live regional URL and its license; full offline Node/Python regression and live Firefox testing of update/error/cache/performance and false positives. No GitHub Actions or release package.
