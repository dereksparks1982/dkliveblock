# Build 310: Facebook scanner and GraphQL triage

Source version 0.3.280, November 3, 2026. No browser acceptance or public release.

The previously combined Meta diagnostics now include a fixed, sanitized `triage` field: inactive protection, disabled recognition, unloaded detector, element picker, zero scans, observed DOM hide, GraphQL response modification, or no hides recorded. Each outcome explains what to check without claiming that a specific ad disappeared. No new network activity, filter rules, telemetry, page scraping, permissions or UI geometry. Five static/semantic regression cases registered; focused V8 evaluation passed, native Ubuntu and live Firefox tests pending.
