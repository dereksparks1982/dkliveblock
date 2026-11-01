# Build 173: current request-control state in exported evidence

**Unreleased 0.3.143, October 31, 2026.**

A historical blocked request remains in the log after a user chooses to allow future matching traffic. Previous TXT/JSON exports could therefore be mistaken for evidence that DK still blocks an allowed request.

- Blocked-request reports now distinguish **blocked when recorded** from the **current** exact site/destination-hostname/request-type remembered Allow state or explicit manually selected Block.
- YouTube compatibility TXT/JSON reports include the same safe, current per-host/type control indicators beside blocked history observations. This supports comparisons after the user changes a toggle.
- No raw URL, path, token, video identity, request payload or private browser history is recorded; these values come from the existing current Site Dashboard snapshot.
- Regression tests cover both report formats, allow/manual-block distinction, and privacy. Actual source modules were executed with synthetic history and toggle fixtures.
- No changes to filtering decisions, host permissions, stream processing, popup controls or approved UI geometry.

**Verification limits:** targeted module tests and source syntax passed. The complete seven-phase Node/Python suite and real Firefox playback remain unverified; no release.

**Next: Build 174.** Strengthen privacy/security audits and ensure all per-site request controls respect authorization and storage failures. No GitHub Actions, packages or terminal work for the user.
