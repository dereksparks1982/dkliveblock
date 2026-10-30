# DK Live Block Build 40: high-confidence automatic ad recognition

**Version 0.3.11 · UNRELEASED source.**

The page-side ad recognizer now covers strongly recognized Google ad iframes, paired ad-unit + ad-slot attributes, explicit advertisement testing labels, existing GPT placements and AdSense containers. Generic sponsored content, login forms, payment dialogs, navigation, video players and article containers remain protected from this heuristic.

The scanning cursor rotates across up to 120 examined candidates per pass rather than repeatedly starting at the top of a long candidate list. Each pass still hides at most 6 newly matched elements, and retained DOM hiding stays capped at 100 elements with reversible display style restoration. This optimization avoids later ads being indefinitely starved on long, dynamically updated pages without adding network requests, executable remote code or new extension permissions.

**Outstanding:** full local regression and live Firefox behavioral tests; YouTube preroll/midroll and Disney+; user acceptance and feature parity gate. No GitHub Actions, downloads or release.
