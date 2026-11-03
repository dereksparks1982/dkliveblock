# DK Live Block: Nesty Evidence Lab

**Established:** November 3, 2026, Build 295 / v0.3.265.

## What was actually integrated
This is **offline developer benchmarking infrastructure**, not a trained AI model, a new live detector, a second production filter engine, or telemetry. Run `npm run audit:evidence` to print aggregate results or `node scripts/nesty-evidence-lab.js --cases` for safe, per-ID diagnostics. The tool reuses the existing `scripts/engine-verdict-audit.js` adapter to exercise both DK's native filter engine and the already bundled Ghostery hybrid engine.

The input is exactly **35 self-authored fictional network cases** under `tests/fixtures/nesty-evidence-v1.json`. Only reserved `.example` hostnames are permitted. Cases include advertising-like requests and necessary **ordinary** requests across Facebook-like feeds and rails, a YouTube-like player, streaming licensing and playback, Pornhub-like thumbnails, popup/navigation scenarios, publisher document exceptions and checkout. They are not actual website captures, independent real labels, or evidence of production site ad removal.

Both engine routes are compared with each case's independently authored expected block/allow decision. Reports include true/false positives/negatives, precision, recall, false-positive rate and **protected-content false positives**, with per-profile partitions. The Ghostery raw `vendorMatch` output is treated only as a diagnostic count. It cannot be scored as a browser block because DK has additional explicit exceptions, redirect policy, user decisions and popup/login protections.

## Boundaries
- All data is hand-authored and synthetic. The v1 validator rejects any hostname outside `.example`, private credentials, URL queries, hashes, unsupported policies, unknown fields, non-synthetic provenance, and unbounded cases.
- Reports contain case IDs, approved categories, Boolean outcomes and aggregate metrics. They do not return request URLs, filter text, page content, account state, video titles, cookies or browsing history.
- No network calls, browser permissions, ML model files, new npm dependencies, imported competitor code, layout changes, popup changes or automatic block/allow decisions were added.
- This lab **does not exercise** Facebook DOM/GraphQL filtering, real YouTube ad streams, Disney+ DRM, Pornhub reflow, Orion capabilities, or actual website interactions. A synthetic match is not confirmation of a blocked real advertisement.
- The development script is not referenced by the extension manifest and is only invoked explicitly or through the existing local release check.

## Follow-on acceptance and model work
Collect independently verified **real ad and normal-content examples** only with explicit approval and provenance, and sanitize anything that could identify a user's account, messages, searches, URLs or sessions. Build a separate schema and holdout-by-site test split. Include login/player/checkout negatives. Measure real false positives, latency, memory and compatibility before considering offline supervised learning, optionally using an appropriately licensed small library. Never authorize a production rule or hide a legitimate post solely from a model score.

The real Firefox full regression suite and owner acceptance remain outstanding for Build 295.
