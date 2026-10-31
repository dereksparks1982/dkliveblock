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

## Live Firefox: dashboard sender regression and YouTube investigation

The initial real Firefox dashboard incorrectly displayed `This action is only available in the extension interface` despite the popup showing three blocked YouTube requests. Cause: the background dispatcher treated all messages with `sender.tab` as content scripts; in Firefox extension dashboards opened in a normal tab can also carry `sender.tab`. The fix verifies the browser-supplied sender URL is in this extension's own `moz-extension://` origin, without trusting page-provided arguments, and adds an offline synthetic test for three blocked requests and adversarial website senders.

The YouTube player still shows an anti-block notice briefly followed by a black screen. ABP's Help Center documents temporary automatic blocker pause to restore video when detected, and describes snippet/anti-circumvention support. Do not implement silent ad allowlisting or disable all blocking on YouTube to falsely claim success; investigate player-required resource compatibility. This patch does NOT claim YouTube playback fixed. All modified code must still pass the full local suite and live Firefox.

## Post-acceptance Firefox field adjustments
Real Firefox screenshot confirms the blocked-requests dashboard now displays five individually indexed YouTube events. Two of the captured resources use YouTube and Google hostnames with image type, but the hostname-only log cannot establish whether the filtered image is advertising, tracking or essential. The old popup was focused on the extension dashboard tab (2 current blocks) while the dashboard displayed its selected YouTube tab (five retained entries), so those counters were not necessarily measurements of the same tab. The popup now resolves the selected website when opened from an extension Site Dashboard and explicitly labels the scoped count.

Individual events also expose privacy-safe filter evidence: host-only literal filter patterns, embedded Ghostery matcher labels, or a withheld reason when rule text could contain private paths or query parameters. The original filter subscription identity is not determined or invented; no raw URL, token or personal data is shown. The new tests are added to the offline runner. Live playback and full local tests still need verification; this is NOT a fix for YouTube's black-screen enforcement.
