# Build 354: YouTube offline lab stale-status guard

**Version:** 0.3.324. **Status:** source-only, unreleased.

The YouTube A/B comparison lab already detects if selected files change mid-read, but its error handler could overwrite a newer Clear or file-selection message. It now displays read failures only when the original request's revision remains current. No raw JSON is uploaded, no playback or response interception changes and no new permissions.

Five tests cover current revision guard, strict comparison/clear handling, no network sinks and current Firefox versions. Full Ubuntu and live browser acceptance remain pending.
