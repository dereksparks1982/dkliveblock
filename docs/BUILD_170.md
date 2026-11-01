# Build 170: one-export YouTube playback evidence

**Unreleased v0.3.140, October 31, 2026**

The owner's latest Shutter Island video screenshot and blocked-request export demonstrate movie playback while advertising-related requests are being blocked. However, normal YouTube videos have previously shown anti-adblock refusal, and the old blocked-request export contained only blocked host/type events and an empty playback-event array. Neither of those is proof of ad removal.

This build makes the **existing** all-blocked or single-blocked TXT/JSON export include a second, bounded, safe `youtubePlaybackEvidence` object for YouTube tabs. It reuses the already available `DKYouTubeReport.build` sanitizer and contains:
- Temporary comparison mode (combined / response only / bridge only / observe only).
- Whether Firefox YouTube response filtering is enabled and available, player-request counts, JSON observed/modified/refused/error counts and by-kind counters.
- At most four coarse first-load observations: pre- and post-enable and one/three-second follow-up states. These events are untrusted page-world signals, never used to decide whether to block anything.
- Clear warning that zero playback-health events is *not* evidence of successful ad removal.

All data is ephemeral and locally exported only when the user clicks Export; no video titles, video IDs, URLs, request bodies, cookies, credentials or player JSON. Non-YouTube exports do not include YouTube-specific observations.

The existing network filters, YouTube player bridge, request interception, permissions, popup controls and approved UI geometry are **unchanged**. Source syntax and local synthetic invocation of the actual source modules passed; the complete current Node/Python suite and real Firefox YouTube playback matrix remain unverified.

No GitHub Actions, downloads or public release.
