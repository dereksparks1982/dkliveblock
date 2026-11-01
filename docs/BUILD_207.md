# Build 207: YouTube response-filter error attribution

**Version:** 0.3.177 (unreleased). **Rollback:** Build 203 (`8f4c6739ddba2cbb1a64918639d014ccf31a8f54`) remains tagged and independently snapshotted.

## Why

The first manually observed-working YouTube session had one response-filter error and zero modified responses, so attribution was impossible. This build adds error-stage and attachment measurements without changing when, where or how a YouTube response is filtered.

## What changed

- `src/youtube-response.js`: record bounded per-tab attempts, successful attachments, and count failures in `attach`, `data`, `stop` and `stream` categories. Existing `errors`, fail-open original-byte behavior, active stream quota, timeout behavior and generation isolation are retained. Return defensive copies of error-stage structures.
- `src/youtube-report.js`: whitelist only those four categories and two numeric counters into local YouTube TXT/JSON; malicious, extra or nonnumeric fields are discarded.
- `src/blocked-export.js`: include the same sanitized measurements in user-requested blocked-request exports.
- `tests/youtube-response.test.js`, `tests/youtube-report.test.js`, `tests/blocked-export.test.js`: verify counters, each failure site, copying behavior and no accidental export of input secrets.

## Checks and cautions

- Isolated V8 execution of the two newly added response/error tests and the YouTube-report privacy test passed. JavaScript syntax checks of modified files passed. Full Node/Python suite, complete original suite and actual Firefox were not run remotely.
- No media bytes, player scripts, request blocking decisions, popup behavior, UI geometry, permissions, remote code or runtime dependencies were changed. We do not claim to have identified the mechanism that stopped the ads; this measures only the background response filter, not page-bridge prunes.
- **Needs morning acceptance test:** Run a regular ad-supported YouTube video and a movie on Build 207, confirm playback, and export the YouTube report to see whether previous error recurs, and which stage recorded it.

No GitHub Actions or public release was created.
