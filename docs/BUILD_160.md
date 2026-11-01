# Build 160: user exceptions also control automatic DOM ad recognition

**Unreleased 0.3.130, October 31, 2026**

The native engine's existing `$elemhide` and `$generichide` website policies suppressed known CSS selectors but the independent DOM ad-slot recognizer stayed on. That could still hide controls or ad-marked content on a site whose element-hiding behavior the user deliberately disabled. This build changes `getStyle` so the content script receives `adRecognition:false` for both policies. Generic recognition is disabled by `generichide` while explicit hostname-specific CSS remains active.

The existing content refresh already calls `adRecognizer.restore()` when the feature transitions from enabled to disabled. Re-enabling or removing an exception permits scanning again. A Firefox-like offline background test exercises transitions from `elemhide` to `generichide` to ordinary site filtering, including CSS visibility and the auto-recognition flag.

No new permissions, runtime dependencies, remote scripts, downloads, Actions or UI geometry changes. Full current Linux and real Firefox tests are still necessary.
