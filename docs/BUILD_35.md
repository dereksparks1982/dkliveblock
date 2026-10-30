# DK Live Block Build 35: Network Monitor and per-tab blocked badge

**Version:** 0.3.6 · **Status:** UNRELEASED development source.

## Added
- Toolbar and settings shortcuts to the dedicated Network Monitor.
- User-initiated per-tab capture of Firefox web requests, including allowed, blocked, redirected, failed, and pending states.
- Per-request hostname, resource type, HTTP method, status code, timestamp, and fixed safe reason fields. No raw URL paths/query fragments, passwords, cookies, headers, body data, payloads or OS-wide packet captures.
- Memory-only ring buffer (1,500 recent requests per tab), total counters for the capture session, dropped-row reporting, website-bound capture with reload persistence, stop/clear controls, filters and explicit CSV export.
- Existing per-tab blocked badge retained and given red-background, white-text styling with an upper count indicator.
- Dedicated safety tests and offline suite registration. No additional permissions; standard baseline ad blocking remains independent from monitoring.

## Not yet verified
- Complete local test suite, live Firefox traffic/capture accuracy, native-message compatibility, YouTube preroll/midroll and Disney+ playback, ABP parity, public release authorization.
- Network Monitor is a Firefox extension monitor, not a machine-wide Linux packet sniffer, HTTPS decryptor or browser DevTools replacement.
