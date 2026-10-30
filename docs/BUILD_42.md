# DK Live Block Build 42: YouTube playback-health diagnostics

**Version 0.3.13, UNRELEASED development source.**

Adds a lightweight, bounded and local-only playback-health probe for visible, playing YouTube video elements. It reports sustained low buffered readiness after at least five seconds and HTML5 media error codes (network, decode or unsupported source) as **coarse categories** only. Paused players do not generate buffering signals. Hidden, seeking, ended or disconnected players do not report. A visible media error may still be reported if the video element becomes paused due to that error. Non-YouTube frames and inactive tabs do not report. Uses an existing 1.25-second page-side check: no new polling interval or network dependency.

The Firefox background validates the actual active tab, original sender URL, top-level frame and current YouTube hostname, and requires active protection/private request logging. At most 30 signals per tab are retained in memory for 30 minutes. A signal records if a blocked **media** request occurred within the previous two minutes, expressly *not* claiming causation. The user can inspect and clear signals in Settings; no stream bytes, URL paths/query, titles, watch positions, account details or external telemetry are collected.

Network rules are **unchanged**. Nothing is automatically permitted or redirected, and manual, confirmed 10-minute host/type playback repair remains available. Expanded unit and background authorization checks are included.

**Outstanding:** full repository Node/Python regression suite, real Firefox YouTube playback and Disney+ testing, and ABP feature parity. No GitHub Actions, downloads or public release.
