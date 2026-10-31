# Build 55: bounded opt-out-only cookie dialogs in open Shadow DOM

**Version 0.3.26 | UNRELEASED source | October 30, 2026**

The optional rejector now finds common cookie banners across the regular document and up to 12 open shadow roots. Search limits are 20 banner candidates, 900 DOM nodes and 35 controls per banner. It preserves keyboard-focused dialogs, excludes link/form/toggle and protected controls across shadow-host ancestry, and attempts at most one explicit rejection click per dialog instance.

The content script performs consent scans no more often than every 3.5 seconds during its periodic loop. No external scripts, additional permissions, telemetry, Accept All fallback or site-wide blocking exemptions were added.

## Unfinished acceptance

Run scripts/test-local.sh in a complete checkout and test real Firefox on Linux with ordinary, open-shadow, nested and dynamically inserted cookie managers. Test multilingual labels, tab focus, checkout/sign-in, false positives, browser-player compatibility and long-page performance. Closed shadow roots are inaccessible and complicated multistep consent flows are intentionally unsupported. This source change is not proof of Adblock Plus parity.

**No GitHub Actions, downloadable build, signing or public release.**
