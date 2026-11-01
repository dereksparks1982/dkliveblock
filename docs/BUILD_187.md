# Build 187: evidence of ads reaching YouTube's player

**Unreleased source:** 0.3.157 (2026-11-01). **No new permissions.**

## Actual evidence from owner exports

Two owner-provided YouTube blocked-request reports (2026-11-01 02:33 UTC and 02:41 UTC) recorded **13** and **20** blocked requests. The accompanying YouTube summaries include **10** and **12** blocked first-party XHRs, respectively, and **zero blocked media requests** in both samples. Both existing `playbackDiagnostics` arrays were empty. This evidence demonstrates DK was blocking some YouTube requests, but **does not say whether an advertisement played**; it cannot establish that an additional blocked-request count would improve playback.

The missing observation was concrete: DK logged buffering, media errors, anti-adblock enforcement and Skip Ad clicks, but **never logged an ad-present state**. The existing `DKPlaybackHealth.isAdBreak` already recognizes YouTube's `.ad-showing` class, but intentionally suppresses buffering detections during ads. The dashboard therefore had no way to distinguish “no playback errors” from “the YouTube player identified an ad.”

## Implementation

- Add `DKPlaybackHealth.createAdProbe()` in a separately scoped, read-only, bounded page probe. The probe checks only the existing top-frame YouTube player `.ad-showing` CSS state. It emits a coarse `ad-showing` event on a newly observed transition, suppresses repeated samples during one break and class flapping for eight seconds, and resets on SPA navigation. It does not read or export watch URLs, media progress, titles, page text, cookies, network bodies or account data.
- Use the existing `content.js` playback-health timer; report only when the active, opted-in diagnostic path is enabled, in the visible YouTube top frame. Neither normal video control nor ad skipping changes.
- Accept the diagnostic in the existing authenticated `background.js` content-message path with same-frame, hostname, permission, privacy and site-policy checks. Reject it for Disney+ or an unrelated site.
- Treat `ad-showing` as **context, not a playback failure** in the deterministic adaptive controller. The model cannot turn this signal into a new bypass or lower filtering quality.
- Include `ad-showing` in the normal YouTube compatibility export, ordinary blocked-request export and dashboard events, explicitly labeled **“player ad state observed”**, *not confirmed advertisement playback and not an ad blocked or skipped*.
- Preserve existing bounded history (max 30/tab, 30-minute expiration) and report data minimization.

## Verification

- Four permanent test files extended: `playback-health.test.js`, `adaptive-youtube.test.js`, `youtube-report.test.js`, `blocked-export.test.js`.
- Loaded and exercised the actual modified and supporting source modules together in a V8 JavaScript harness. **14 focused assertions passed** for initial ad flag, no repeated count, suppression of flapping, new ad break, site restrictions, adaptive-controller protection, export inclusion, and non-disclosure of private inputs. Source syntax parsed.
- Full Ubuntu Node/Python suite remains **unrun** because this execution environment cannot resolve GitHub to clone the entire repository. **Real Firefox and YouTube ad playback remain unverified**. This build improves observability rather than claiming the missing ads have been blocked.

## Next: Build 188

Use the newly distinguished `ad-showing` signal and response/bridge diagnostics to improve controlled, privacy-safe outcome comparison. Prioritize a proven filtering mismatch rather than inventing speculative request or media-stream rewriting. The established major missing capabilities remain uBlock-level scriptlet, HTML filtering, CSP, advanced redirect and site coverage. No GitHub Actions, remote AI, public release, downloadable patch, terminal commands, or layout changes.
