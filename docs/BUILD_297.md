# Build 297 / v0.3.267: reversible YouTube player API isolation experiment
**Date:** November 3, 2026. **Branch:** `main`. **Status:** source candidate; real Firefox acceptance pending.

## Why this build
The owner's screenshot confirms an ordinary YouTube video is being refused because YouTube recognizes the ad blocker. It is not the separately tested Free with Ads movie catalog, and not a cosmetic popup. Our old "Observe only" diagnostic disabled player JSON modifications but left all network blocking active. That test could not distinguish blocked core first-party player API requests from response rewriting.

## Implementation
- Adds opt-in, **one-tab, one-hour** "Player API passthrough (test only)" to the existing collapsed Site Dashboard YouTube experiment selector, with explicit browser confirmation and no persistent allowlist.
- MAIN-world page bridge enters **read-only observe** state and Firefox response filtering is disabled in this mode. Neither subsystem modifies player JSON or streaming bytes.
- The background can preserve only **HTTPS POST** requests to exact official `youtube.com`, `www.youtube.com`, `m.youtube.com` or `music.youtube.com` hosts and exact `/youtubei/v1/player`, `/youtubei/v1/get_watch`, `/youtubei/v1/resolve_url` paths. The existing `DKYouTubeResponse.requestEligible` additionally requires a valid Firefox request type, tab ID and official YouTube page source.
- Threat protection, manual blocks, global/site/tab pauses and authentication protection retain their existing priority. Feed, search, Shorts, ads, tracking, media, navigation, other hosts and all other request paths stay under normal filter rules.
- The temporary mode is cleared on tab/host change, expiration or selection of Normal. Exports, offline A/B comparisons and playback assessments preserve the new mode label. Added nine focused Node tests and expanded the simulated Firefox background request regression suite.

## Limits
The tool intentionally can allow a previously blocked first-party player API request, which may include advertising metadata. It **does not** turn off general ad filtering, automatically hide YouTube's warning, or establish a real-world bypass. Root cause and actual player repair remain **unverified**. The full exact-commit Ubuntu suite and real Firefox tests are pending.

## Owner test, when convenient
On the affected regular video: in Site Dashboard select the YouTube tab, expand "YouTube compatibility test modes", choose "Player API passthrough (test only)", explicitly confirm and reload. Observe whether playback resumes, whether ads appear, and whether the refusal stays. Export and review sanitized diagnostic report. Compare with "Observe only" after a reload, then restore "Normal (both methods)." Test the Free with Ads movie category separately.
