# DK Live Block Build 63: first Firefox field test fixes

Unreleased development source v0.3.33. The user's exact uploaded artwork is bundled into Firefox icons. Individual blocked events have a direct View blocked action, a detailed explanation, local known service-operator hints, optional external investigation links and opt-in RDAP registration information. RUTUBE's observed VPN-off nag and autumn paid-subscription promotion are recognized as reversible distractions. Sensitive login, payment, media and authentication controls remain protected. No VPN, proxy or DNS settings are changed. All remote registration lookups require the user's explicit click. No URL paths, tokens, cookies or files are sent.

Verification: new JavaScript source parses, but the full local Node/Python suite and live Firefox/RUTUBE tests for v0.3.33 remain pending. Build 61's 437 green JavaScript tests are not evidence that this newer build passes. No ZIP, GitHub Actions or release was created.

## First full local regression acceptance, October 30, 2026

Verified from the user's actual Ubuntu desktop terminal output following `git pull --ff-only` to commit `123f8bd`:

- No GitHub Actions; complete inventory of 93 Node test files and nine Python test scripts; JavaScript syntax checks all passed.
- Extension structure: **126 tests, 126 passed, 0 failed**.
- Python companion regression: six unittest invocations completed successfully (4, 6, 4, 2, 6, 4 individual test cases).
- Offline regression: **324 tests, 324 passed, 0 failed**.
- Firefox packaging / HTML page audit: **PASS, v0.3.33**.
- Final output: `FINAL PASS: Local source checks; browser and video playback remain unverified`.

**Decision:** This build passes its complete offline test suite (450 Node tests). No claim of visual Firefox acceptance, actual RUTUBE modal removal, icon toolbar rendering, external RDAP success, YouTube/Disney+ playback, Mozilla signing or public readiness is warranted from this test log. Next step: reload the temporary Firefox extension, inspect icon and count-to-detail UI, and check RUTUBE banner, video playback and privacy against the live page. The local log is in memory only; enable the existing private request-log option before expecting new rows if it has been disabled.
