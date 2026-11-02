# Build 257 · v0.3.227: event-driven cookie sentinels

- Added `src/cookie-sentinels.js` as a local event-driven dispatcher for HTTP Set-Cookie response events, browser cookie change events, and JavaScript cookie writes.
- Wired a passive HTTP response observer into DK's existing background script. It activates only with DK enabled, request logging enabled, and a supported active website tab. It records bounded cookie metadata, hostname and attempted-set counts, not cookie values, full URLs or response headers.
- Added a separate `src/cookie-agents.html` local observation viewer and a Site Dashboard link. It can inspect and clear recorded observations.
- Browser cookie-change and JavaScript-write hooks were **not** activated. The HTTP observer only records an **attempt**, not verified storage or blocking. Existing filtering remains unchanged.
- Tests: source compilation and a small isolated Set-Cookie parsing smoke test were performed. No full Ubuntu Node suite or live Firefox acceptance.
