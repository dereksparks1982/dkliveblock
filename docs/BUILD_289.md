# Build 289 / v0.3.259: Layout repair diagnostics
**Date:** November 2, 2026. **Branch:** `main`. **Release:** internal only.

A first-party, locally bundled, count-only `diagnostics()` method examines at most 12 Pornhub video-list groups with 120 children each. It reports eligible groups, video tiles, empty ad-only placeholders, mixed lists, short lists, oversized lists, applied grid classes and scanning counts. It returns no text, element selectors, video URLs, account identifiers or browsing history, and does not itself modify the DOM.

The existing Site Dashboard gains one collapsed section for Pornhub only. It calls a new extension-origin-only background message tied to the exact live Pornhub tab, then the already-running top-frame content script. A Recheck button refreshes the counters on demand. Unsupported sites and watch/login pages remain untouched. A non-ad accessible label on an empty-looking slot prevents its removal. The original Build 288 user choice stays OFF by default with complete restoration.

Five new registered Node checks cover safe observations, site-scope, interactive controls, bounded execution and dashboard integration. No new runtime dependency, network traffic, popup UI geometry change or AI-driven blocking. Full Ubuntu and real Firefox visual acceptance remain pending.
