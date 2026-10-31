# Build 56: dynamic ad recognition, QA readiness and documentation cleanup

**Version 0.3.27 | UNRELEASED source | October 30, 2026**

- Add open and nested Shadow DOM ad recognition (12 root/900 node limits), while closed roots remain uninspectable.
- Preserve round-robin scan fairness across DOM scopes, 120 candidate checks per cycle, six hiding operations, bounded local restoration.
- Protect form, article, sign-in, media and focused content, including shadow-host ancestors.
- Debounce ad insertion and ad attribute changes to one scan per 450 ms; ignore the extension's own style changes. Keep periodic fallback.
- Re-hide already tracked advertising slots when the retention cap is reached.
- Fix historical version-locked test assertions and add focused recognition and mutation tests.
- Make README user-facing again, preserving the earlier history in docs/CHANGELOG.md.
- Add a localhost-only visual QA page and Python standard-library server. No browser auto-open or third-party requests.

**Not yet accepted:** complete local Node/Python regression suite, real Firefox regression, YouTube pre/midroll and Disney+ authorized playback, login and payment compatibility, long-duration performance, Mozilla signing and ABP parity. The local QA page is synthetic only.

No GitHub Actions, new permissions, external dependencies, downloads or public release.
