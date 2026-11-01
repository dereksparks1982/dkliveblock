# Build 184: safer automatic adaptation through guarded filter updates

**Unreleased development source:** 0.3.154 (2026-11-01).

## Why this matters
DK already has automatic 24-hour HTTPS filter-list updates, local recognition of ad containers, YouTube pack versioning/rollback, and passive playback health reports. These are pieces of an adaptive blocker, but they are not autonomous online learning or a system that writes its own filtering code.

Previously, an otherwise valid 200 response could replace a large working subscription with a drastically smaller list. A partial/corrupted published list with a superficially valid header could drop thousands of active defenses until a subsequent corrected refresh.

## Build 184 behavior
- Add a small independent, data-only `src/subscription-update-guard.js` module to the persistent Firefox background script set. No extra permissions or downloaded code.
- Count actionable (non-comment/header) lines in the cached and candidate text, with a bounded scan of up to 350,000 lines. Count only, never collect or send browsing URLs, rule lines or list contents.
- **When the previous working list has at least 120 rules**, quarantine a candidate if its actionable count drops below **25%** of the cached count. Keep the active cache, add a short local source error, and retry on the existing automatic daily refresh.
- Preserve normal revisions (including 25%+ changes), 304 conditional updates, first installs, and legitimately small custom subscriptions. Preserve all existing `DKListIO` HTTPS/data validation, cache metadata, and YouTube pack's own version/rollback checks.
- Both built-in and user-added custom subscriptions are guarded. No arbitrary page scripting, dynamic remote JavaScript, broad auto-allowlisting, speculative network blocking, telemetry, or changes to approved UI.

## Verification
Executed the actual modified module and inspected background/manifest wiring in isolated V8 checks. **11 focused assertions passed**, including large-drop rejection, ordinary changes, exact 25% threshold, small/new subscriptions, privacy of the result, and both refresh call sites. Added three permanent unit tests to `tests/subscription-cache.test.js`.

**Not run:** complete seven-phase Ubuntu Node/Python runner, actual scheduled Firefox update, streaming acceptance, and live YouTube preroll/midroll checks. The guard does not create new filter rules. It only prevents a particular failure mode during automatic defense updates.

## Next direction
- Add local privacy-preserving classification of effectiveness and playback-health regressions before switching among preapproved YouTube mitigation strategies.
- Evaluate canary validation for downloaded filter-list updates so rules that break sign-in/media can be quarantined and rolled back, without silently weakening protection.
- Continue measured parity work on network rules, cosmetic filtering, scriptlets, and exception semantics. Avoid copying incompatible GPL code without meeting license requirements.
