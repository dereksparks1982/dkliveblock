# Build 390 / v0.3.350: YouTube warning stability and Facebook evidence integrity

**Date:** November 4, 2026. **Status:** Internal main-branch development build; not public.

## Changes
- Complete the previous candidate fix started in c97d920: an in-player YouTube warning no longer triggers automatic reload of ordinary video. Normal network filtering, player processing and dormant recoverRefusal code are unchanged.
- A user-requested Facebook runtime inspection validates tab identity and full URL after asynchronous content/GraphQL collection. A changed/closed tab cannot generate a mixed-page report; the URL is not stored or exported.
- Parallel clicks on Inspect cannot trigger competing snapshots or enable export prematurely.
- Existing collapsed, opt-in Facebook panel displays only bounded aggregate unanchored, deferred and pending label counts. When hides and unresolved labels coexist, the diagnostic identifies mixed evidence instead of implying all visible ads were removed.
- Bump manifest and package to v0.3.350, register isolated regressions and remove build history from English README according to the Company Bible.

- Build 390 test correction: The owner's Ubuntu run found that repeated `enforcement` events are deliberately de-duplicated for 20 seconds. The regression now expects the first event to be recorded and subsequent duplicates suppressed, while asserting zero reloads and refreshes throughout. No blocking behavior or version changed.

## Validation boundary
- Direct isolated V8 module behavior checks executed before committing.
- Additional Node regressions are registered, as is the existing Build 390 YouTube background test.
- Full local Ubuntu test suite and real Firefox Facebook/YouTube browser acceptance were not run in this environment.
- No permission, website geometry, network filtering decision, telemetry or stored preference changes.
- Original server-side YouTube refusal and live Facebook ad disappearance remain unverified.

## Next checks
Run npm run test:local on Ubuntu; test an ordinary YouTube watch video with and without a transient refusal; test a visible Facebook Ad alongside organic posts and inspect the local diagnostic report. No public release without owner sign-off.
