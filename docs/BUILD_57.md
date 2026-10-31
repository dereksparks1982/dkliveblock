# Build 57: streaming compatibility and localized ad-skip hardening

**Version 0.3.28 | Unreleased development source | October 30, 2026**

## Improvements
- The conservative YouTube helper recognizes explicit skip-ad labels in English, French, German, Spanish, Portuguese, Turkish, Russian, Arabic and Chinese.
- Button visible text, aria-label and title must independently describe a recognized ad-skip action; a contradictory value blocks the click. Form submissions, links and toggle controls remain untouched. Unlabeled recycled controls are not auto-clicked.
- Previous per-button click cooldowns persist during ordinary scanning but reset explicitly on SPA navigation.
- YouTube's observer recognizes localized buttons and title changes without broadening the assistant to other sites.
- HTML5 playback-health diagnostics suppress buffering reports during known ad breaks, offline periods and hidden pages. Malformed DOM getters fail safely. No media content, playback rates, DRM or streams are modified.
- Host-only streaming diagnostic records and user-requested temporary streaming repair exceptions reject malformed DNS labels.
- Added targeted unit/VM regressions for translations, conflicting labels, unsafe controls, cooldowns, watcher signals, false health reports and host validation.

## Outstanding acceptance
Run the full offline suite and real Firefox manual tests on YouTube (preroll, midroll, SPA, signed-in/out and localized settings) and Disney+ with an authorized account. Verify genuine video remains watchable, no false clicks, no new login/checkout errors, and no unrequested network allowances.

This is **not** proof of YouTube ad elimination or Adblock Plus Premium parity. No Actions, new permissions, external dependencies, download or release.

## QA fixture reconciliation

Existing Node VM tests for the content script were missing the newer cosmetic-debug interface, and the older YouTube anti-adblock fixture also missed the streaming watcher. These fixtures now supply inert test doubles matching their intended behaviors. A source-level contract test protects against repeating the missing-module setup. This is test maintenance, not a new production permission or feature claim.
