# Build 408 / v0.3.368: YouTube error-screen preservation

**November 13, 2026. Main only.**

YouTube can send `playabilityStatus.errorScreen` alongside `playabilityStatus.status = "OK"`. Prior DK filters only treated non-OK statuses or a direct error object as refusal evidence, potentially removing ad-placement metadata while YouTube was displaying an unrelated playback error.

The already integrated `src/youtube-response.js`, `src/youtube-page-bridge.js` and `src/youtube-feed.js` now recognize this structural error evidence and fail open without modifying the original player/feed payload. The MAIN-world bridge uses its existing own-data lookup; no getters are invoked. Normal playable responses still receive the existing selective ad metadata filtering. This improves safety without licensing or adopting another blocker.

New synthetic regression cases cover direct, missing-status and array refusal variants, nested player string/object envelopes, resolve-url prefetch, feed/next, normal player behavior, existing same-video retry protection and request origin safety. No extension permissions, downloads, ad allowances, GitHub Actions, new dependencies, extra telemetry or UI changes.

A real YouTube refusal is not solved or bypassed by these guards; actual browser playback and the full native suite remain unverified.
