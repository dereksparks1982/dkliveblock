# Build 295 / v0.3.265: offline Nesty Evidence Lab

**Date:** November 3, 2026. **Branch:** `main`. **Status:** development milestone, owner Firefox acceptance and full native Ubuntu regression pending.

- Added an offline, synthetic-only labeled case corpus with **35 hand-authored reserved-domain network scenarios** spanning Facebook-like feed/rail/login, streaming-player negatives, video thumbnails, popup navigation, ordinary checkout, native exceptions and network method matching. These are NOT actual browser observations.
- Added `scripts/nesty-evidence-lab.js`, which exercises existing DK native and Ghostery hybrid network engines using the already installed `scripts/engine-verdict-audit.js` bridge.
- Scores true/false positive/negative verdicts, protected normal-content false positives, precision, recall and false-positive rate by fictional site profile and overall. Raw vendor matches are treated as diagnostic, not production decisions.
- Strict schema rejects private/live site hostnames, credentials, query strings, extra fields, unsupported policy/method data and unbounded cases. Reports include no raw requests or rule text.
- Registered eight Node test cases, `npm run audit:evidence`, and a local offline release-check step; see `docs/EVIDENCE_LAB.md`.
- Bumped manifest/package version only. Working Firefox network filtering, streaming, Facebook controls, layout repair, approved UI geometry, user choice and all permissions remain unchanged. No model runtime, new third-party code, telemetry or auto-generated blocking rules.

**Verification boundary:** JavaScript source/test syntax can be checked before commit. Exact-commit full Ubuntu suite and real Firefox acceptance need to run in the target Linux environment. Synthetic examples cannot establish feature parity or trained-model readiness.
