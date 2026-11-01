# Build 165: offline native filter-language inventory

**Unreleased 0.3.135 (2026-10-31).**

## What it adds
`scripts/filter-coverage-audit.js` examines locally bundled text filter lists and categorizes each line as a supported native network, cosmetic or procedural rule, or a recognized unsupported class such as scriptlet, HTML filtering, CSP, redirect-rule, extended cosmetic, regex removeparam, entity domain or other.

Its report includes **counts only**, not URLs, filter text, user history or request logs. It reads bundled `filters/*.txt`, without any network activity. Strict limits cap 20 MB of input and 260,000 lines; tests verify category counting, malformed input and bounds. The offline seven-phase runner now includes `tests/filter-coverage-audit.test.js`.

## Important limitation
This is a *native-parser* capability inventory of bundled source files only. It cannot establish effective Ghostery coverage or the dropped-rule percentage for EasyList/EasyPrivacy downloaded on an individual browser. Those must be measured separately from consented local list snapshots, not claimed from this report.

No changes to the live Firefox filtering pipeline, no GitHub Actions, no downloads or public release. Source and synthetic category smoke passed, full current Ubuntu/Firefox acceptance remains unverified.
