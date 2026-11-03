# Build 296 / v0.3.266: recognize in-player YouTube enforcement without hiding it

**Date:** November 3, 2026. **Branch:** `main`. **Status:** diagnostic instrumentation, not a playback repair.

## Evidence
On November 3 the owner shared a screenshot from an **ordinary YouTube video** showing a full in-player playback refusal. The heading says that ad blockers violate YouTube's Terms of Service and the body says video playback is blocked unless YouTube is allowlisted or the ad blocker is disabled. This is distinct from a removable popup, and it is distinct from the YouTube "Free with Ads" movies previously tested. Video URL, account and video/channel title are intentionally omitted from this public engineering document.

## Changes
- Add a bounded, read-only `DKPlaybackHealth.createEnforcementProbe()` to sample only seven known `#movie_player`-scoped candidates. It uses the existing `DKAntiAdblock.isPlaybackEnforcement` exact-text logic; it does not hide the message or falsely claim playback resumed.
- Report solely the existing, fixed `enforcement` playback-health kind through the same local diagnostics pipeline. No message text, URL, player payload, video title or account data is retained, sent, or exported. It is rate-limited, requires a visible player, is active only on YouTube top-level content, and resets across SPA navigation and protection-state changes.
- Add eight focused tests covering screenshot text, false positives, hidden/throwing DOM, repeated events, SPA reset, report privacy, and source integration; register in local offline runner.
- Increment extension/package version to 0.3.266; no permissions, browser UI, network filters, page bridge code, account controls, playback rewriting, streaming rules or CSS behavior changed.

## Verification limits
JavaScript syntax and focused development smoke checks were performed while preparing the change; the exact-commit full native Ubuntu suite and real Firefox validation remain pending. This build **does not defeat YouTube's refusal**. The urgent regression remains open until the underlying cause is isolated with existing YouTube diagnostic exports and a browser comparison.

## Next investigation
Get one sanitized `Export YouTube diagnostics (.json)` report from the blocked ordinary-video tab, compare response-filter attachment counts, page-bridge prune samples, enforcement events and first-party blocked request sources. Then use the existing one-tab temporary modes (combined / response-only / bridge-only / observe) for a controlled test. Never approve a broad YouTube allowlist, content rewriting change, or automatic enforcement hiding solely from this screenshot.
