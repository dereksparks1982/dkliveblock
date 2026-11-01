# Build 176: regular YouTube first-load and SPA player-data timing

**Unreleased v0.3.146, October 31, 2026**

## Problem and bounded fix
Regular YouTube videos still show ads or, in some runs, reject playback. The main-world page bridge already removed known ad fields (`adPlacements`, `adSlots`, `playerAds`) from the existing `ytInitialPlayerResponse` when the bridge was enabled. A concrete gap remained: the page can assign this property **after** the enable-time check, or replace it during a single-page video navigation. Those later objects were only observed in read-only diagnostic timers, not cleaned.

- In active bridge modes, reapply the same bounded bootstrap metadata cleanup at 1 second and 3 seconds after activation, and after the YouTube `yt-navigate-finish` event. A navigation starts a fresh 1-second/3-second window; outdated timers do not run against the new window.
- The `observe` experiment mode stays read-only. `disable` stops pending cleanups. Existing player JSON response filtering, arbitrary media streaming and DRM bytes, global UI geometry and normal-network rules are unchanged.
- Preserve media structures, video details, error/refusal statuses and getter-only or hostile page properties. Do not install writable property traps or alter YouTube request signatures.
- Add optional boolean `playerMetadataCleaned` to late, locally exported bootstrap observations. Unlike a zero ad-field count, this says whether the **late** check found and removed known player ad metadata. This is an untrusted page-world diagnostic and **never a blocking decision**.
- Expand page-bridge and report sanitizer regression fixtures for late arrivals, SPA navigation, observe-only/disable, refusals and accessor safety, and no title/video-id/URL leakage.

## Verification and limits
The actual modified bridge was executed in a restricted synthetic V8 page harness and passed late-arrival, navigation, observe-only and disable checks. The response/report source modules were run together with a synthetic boolean cleanup record and passed sanitization checks. JavaScript syntax for modified files passed. The complete seven-phase Ubuntu Node/Python suite and real Firefox normal-video/preroll/midroll/no-ad/film acceptance **have not been run**; we cannot claim reliable ad removal or parity.

**Next planned Build 177:** use exported evidence to distinguish late bootstrap cleanup, filtered player API responses, anti-adblock refusals and unblocked regular-video ads. Implement a targeted correction only when it preserves playability. No GitHub Actions, public release or user download until accepted.
