# Build 151: constructor-safe sponsored feed removal

**Unreleased version 0.3.121 (2026-10-31).**

The YouTube browse/search/Shorts/playlist/watch-next JSON scanner preflighted its target arrays, but committed its changes with `array.splice()`. In Firefox's page-world script, a website can override `splice`, and even the built-in version can reach a page-defined `constructor` or `Symbol.species` accessor. Such changes can throw and prevent eligible sponsored entries from being removed.

Use bounded in-place compaction of already-preflighted own, writable indexed data properties; shrink only the recognized array length. No invocation of `splice` or species construction; organic entries keep their original order. Preserve the existing all-arrays preflight, refusal and malformed-schema bailouts, size caps, host/method restrictions and no-media-byte policy. No extra permissions or runtime dependencies, no new remote JS, no GitHub Actions, no UI changes.

Added new regression cases for hostile constructors, overridden splice, organic ordering and cross-array read-only rollback, including a MAIN-world bootstrap fixture. Source-level smoke checks covered these behaviors. Full 111-file Node suite, Python companion tests, Firefox ad-free field tests, and final release gates are not claimed complete.
