# Build 155: playback-refusal diagnostics and response-write safety

**Unreleased version 0.3.125, October 31, 2026.**

The current Firefox response rewriter previously counted recognized YouTube player refusals as ordinary unchanged JSON. This concealed a useful fact when troubleshooting an anti-adblock message: response metadata stripping cannot fix a refusal already supplied by the server. Build 155 adds privacy-limited **refused** counters at the whole-tab and per-kind levels, with a distinct **prefetch** category for the resolve_url support added in Builds 153–154. The dashboard and voluntary YouTube TXT/JSON reports expose these counters without saving or exporting video IDs, URLs, reasons, titles, authentication or raw player JSON. Refused is a subset of unchanged, not a separate kind of successful block; it denotes explicit playability denial or structured response error, not necessarily anti-adblock enforcement.

Also hardens onstop handling when writing modified JSON: after an attempted modified write, a write exception must not append the original player JSON behind the partial modified payload. Disconnect and count a processing error instead of producing two concatenated JSON documents. Preserve pass-through for errors before any modified bytes are attempted. A browser stream whose write operation fails after accepting partial bytes may still produce an incomplete response and must be investigated in real Firefox.

Tests cover refused top-level and nested player results, prefetch classification, privacy-safe export, defensive counters and write-failure no-replay behavior. No new dependencies, permissions, remote scripts, UI geometry changes, Actions or release. Full Ubuntu Node/Python tests and live Firefox ad-free playback/Disney+ remain unverified.

Source audit also identified and repaired two preexisting JavaScript test syntax blockers: a missing closing brace in the Build 153 resolve_url fixture and a non-async test using await in the Build 154 MAIN-world fixture. Both corrected complete test files now pass JavaScript parser checks. This does not imply the entire offline test suite passed.
