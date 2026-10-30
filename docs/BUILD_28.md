# Build 28: opt-in unfinished YouTube video memory

**Version 0.2.9 | UNRELEASED**

This feature directly addresses forgetting a partly watched video. The setting is under Video and cookies and defaults to OFF. With explicit opt-in, the content script reports regular top-frame YouTube videos only after 60 seconds, only when playing outside identified advertising breaks, and no more than once every 30 seconds. Finite duration, progress and canonical 11-character YouTube ID are required.

The background validates the sender frame, origin and current tab video, rejects disabled/ineligible requests, and throttles writes. It saves only to the existing capped local My Saved Videos library; no telemetry, account, or remote server is involved.

Disabling the option stops new automatic saves. Previous entries remain until manually removed or the library is cleared. No video or player position is gathered by this new feature while disabled.

**Not verified in real Firefox:** SPA navigation consistency, ad-break detection, actual play/pause behavior, YouTube preroll/midroll blocking, Disney+ playback or full repository regression acceptance. This source is not a release.
