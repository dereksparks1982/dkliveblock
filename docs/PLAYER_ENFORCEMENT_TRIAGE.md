# YouTube in-player playback enforcement: DK Live Block triage

**Updated November 3, 2026.** This is an active investigation, not a confirmed fix.

### What the owner showed
A November 3 screenshot shows ordinary YouTube playback refused within the video frame with the warning that ad blockers violate the site's Terms of Service and the explicit notice that playback is blocked. This is **not** a harmless banner that may be safely closed. The separately tested YouTube *Free with Ads* movies were not reported failing in this screenshot; do not merge the two test scenarios.

### Diagnostic code paths
The existing anti-adblock cleanup protects refusal messages from cosmetic suppression and reports a coarse `enforcement` event when such a dialog is examined. Build 296 adds a separate, read-only in-player sampler so an error rendered within `#movie_player` can be recorded even if it is not an ordinary overlay. It checks only bounded, visible in-player text and uses the same existing refusal recognizer. No media/player data, raw text or URL is exported. A detected event is **not** evidence of the particular server or client cause.

Current potentially involved systems are the DK/Ghostery subscription filter selection, YouTube player JSON background response filtering, MAIN-world page bridge, settings, updated subscription lists and other installed extensions. Old successful owner playback tests are historical only; YouTube may vary by session/account and video category.

### Owner-supported evidence collection
1. Open the **affected ordinary-video tab** in Firefox with the current DK extension installed. Open DK Live Block **Site Dashboard**, select that same tab, and choose **Export YouTube diagnostics (.json)** under Streaming playback diagnostics. The report may contain browser-site/request metadata: inspect before sharing, and remove anything private.
2. Use the existing temporary YouTube compatibility test modes in Site Dashboard only when ready for a controlled test: one ordinary video, one mode at a time; reload after each selection. **Observe only** disables the two player JSON rewriting approaches but **does not disable network filtering**. Thus a failure in observe mode does not prove the cause is outside the extension.
3. Compare with a clean Firefox test profile or with other ad-blocking extensions temporarily disabled to isolate conflicts; restore usual settings afterward. Also record signed-in status as a yes/no condition, not account identity.
4. Test the Free with Ads movie category **separately**. Preserve playback, media, authentication, ordinary links and known working Disney+ paths.

### Avoid
Never silently hide an in-player refusal, indiscriminately permit first-party media or login requests, disable the blocker universally, or publish video IDs, watch URLs, account data, user browsing exports or playback-response payloads. Release or parity claims require actual browser success.

Current status: **ordinary-video regression confirmed by owner screenshot; root cause and repair unverified.**

### Build 297 additional controlled test
The original `observe` mode leaves first-party request blocking intact. Build 297's new `player-pass-through` mode is separately confirmed in Site Dashboard: no MAIN-world/response JSON edits, but exact player, get_watch and resolve_url HTTPS POST requests can bypass list blocks when the existing strict first-party origin checks pass. Other ad filtering remains enabled. If behavior differs between these two modes, review relevant block evidence before any permanent rule change; correlation alone does not prove the cause. The mode expires and can be undone by selecting Normal.
