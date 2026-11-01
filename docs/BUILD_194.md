# Build 194: prevent malformed clock values in streaming repair permissions

**Unreleased:** 0.3.164, 2026-11-01.

Explicit ten-minute streaming recovery exceptions now reject invalid/overflowing clocks, fail closed when expiration cannot be evaluated, and preserve exact tab, source-host, request-host and request-type scope.

Permanent regression coverage is included. No claim of passing the seven-phase Ubuntu suite or live Firefox playback. No GitHub Actions, public package, or user terminal work.
