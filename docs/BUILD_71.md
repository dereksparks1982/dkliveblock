# Build 71: YouTube first-party blocking triage

Unreleased 0.3.41 (2026-10-31). A user-provided blocked report showed many www.youtube.com background requests blocked by the native filter engine. Those are first-party requests and cannot safely be treated as advertising from the hostname alone. Add separate counts for blocked first-party YouTube XHR, images, media and known third-party ad infrastructure, with safe matched-rule source names. Show the summary in Site Dashboard's playback diagnostics and attach to local blocked TXT/JSON exports. No raw URLs, video IDs, paths or tokens. Does not change blocking, bypass YouTube enforcement or mutate playback responses. Added unit, export and UI tests. Full Ubuntu suite and live Firefox acceptance pending.

Follow-up: YouTube triage now loads before blocked-export.js; UI test asserts script dependency order.
