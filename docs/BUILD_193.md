# Build 193: reject invalid temporary request-allowance clocks

**Unreleased:** 0.3.163, 2026-11-01.

Temporary request exceptions now require a finite nonnegative clock that cannot overflow their expiration; query and list paths reject invalid times without silently treating malformed input as a valid permission.

Permanent regression coverage is included. No claim of passing the seven-phase Ubuntu suite or live Firefox playback. No GitHub Actions, public package, or user terminal work.
