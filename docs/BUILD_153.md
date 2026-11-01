# Build 153: YouTube navigation prefetch ad metadata

**Unreleased version 0.3.123 (2026-10-31).**

A narrowly identified first-party YouTube `/youtubei/v1/resolve_url` POST API response can include a video-prefetch player object under `endpoint.watchEndpoint.unserializedPrefetchData.playerResponse`. The current engine did not inspect this envelope, even though it already supports ordinary player, get_watch, browse, search, Shorts and playlist paths.

The independently implemented change adds this exact endpoint to the background Firefox response listener and the existing MAIN-world fetch/XHR bridge. Only the recognized nested player object is eligible for deleting the existing known advertising fields (`adPlacements`, `adSlots`, `playerAds`). Valid playback metadata, signed media URLs, parent navigation data, login/auth responses and unknown schemas are unchanged. Refusals are fail-open. HTTPS YouTube-host, valid originating tab, POST/XHR and 200/JSON restrictions continue to apply, with the existing size, stream timeout and memory limits.

Regression fixtures cover allowed and blocked URLs/methods, preserved navigation/media properties, denial/error cases, page-world fetch JSON and text handling, and listener registration. Synthetic source-level smoke checks passed for the core behavior. Live Firefox/YouTube prefetch, ads, and anti-block enforcement still require acceptance and no competitor parity is claimed. No new dependencies, downloaded scripts, UI movement, GitHub Actions or public release.
