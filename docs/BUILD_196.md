# Build 196: prioritize blocked media evidence in YouTube diagnostics

**Unreleased:** 0.3.166, November 1, 2026.

The YouTube blocked-request triage now classifies any blocked media by resource type before advertising-infrastructure hostname categories, so an actual media interruption is not hidden inside an ad-server count.

Changed JS files parsed in the isolated V8 environment; permanent unit regressions added. No full Ubuntu runner or real Firefox verification, public release or GitHub Actions.
