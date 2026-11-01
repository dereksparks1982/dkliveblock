# Build 162: Offline differential verdict observatory

**Unreleased v0.3.132, October 31, 2026.**

Claude's independent review identified a potential false-positive pathway: the partial native parser can block a rule before bundled Ghostery sees an exception that native cannot parse. We must compare the engines before changing production precedence.

`scripts/engine-verdict-audit.js` loads the real bundled Ghostery engine and DK's existing native and hybrid engines in an offline Node VM, evaluates 12 synthetic rules/request scenarios, and outputs only case identifiers, categorical disagreements and boolean decisions. It cannot contact the network and never reports real browsing URLs, filter text or personal data.

`tests/engine-verdict-audit.test.js` covers native-block/vendor-exception, vendor-block/native-allow, native exception/vendor block, redirect and rewrite results, page/popup bypasses, case validation and safe output. The official seven-phase runner now registers this suite and **the Build 161 self-test it previously omitted** (`tests/test-local-runner.test.js`).

The real extension's filtering rules, settings and runtime behavior remain unchanged. Source syntax and synthetic comparison logic were smoke checked, but the complete Ubuntu suite and live Firefox acceptance have **not** been executed; this is not a green test certificate. The next step is to run the complete local suite and use the evidence to design safe precedence changes.

No GitHub Actions, external dependencies, downloadable packages or public release.
