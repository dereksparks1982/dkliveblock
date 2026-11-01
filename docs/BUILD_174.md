# Build 174: extension-origin and settings-transaction hardening

**Unreleased development source v0.3.144, 2026-10-31.**

## Correctness and security changes
1. Messages with an explicitly supplied non-extension `sender.url` but **no browser-supplied tab** are rejected at the top of the background message handler. Previously this case could bypass the coarse `fromContent` classification and reach extension-interface actions. The browser controls `sender.url`; a web page does not get to choose a trusted extension URL.
2. `saveSettings` now validates custom subscription URLs, paused website lists, cookie-rejection pause lists and distraction pause lists **before updating any live settings**. Previously an invalid late `paused` value could return an error after updating other settings or cached subscription state in memory. This new ordering prevents partial in-memory mutation for those user-input validation failures.
3. Regression tests cover an explicit foreign no-tab sender, a recognized extension-origin settings sender, unauthorized content messaging, four invalid mixed-setting submissions, a valid preflight, and whether a persistent request-control storage failure rolls back the Allow choice and leaves ad filtering enabled.

## Test scope
Source-syntax parsing passed for all changed JavaScript files, and the actual extracted message-origin and input preflight branches were executed against synthetic sender/option fixtures. This does **not** replace the complete seven-phase Linux Node/Python regression or Firefox integration testing, both still pending.

No added permissions, UI geometry changes, YouTube response mutations, GitHub Actions, downloads or public release.

**Next: Build 175.** Audit offline filter-matching time and address measurable hotspots with bounded test coverage, without changing the currently working Shutter Island movie playback path.
