# Build 294 / v0.3.264: Same-thumbnail integrity for layout preview
**Date:** November 3, 2026. **Branch:** `main`. **Status:** committed source milestone; native Ubuntu and real Firefox acceptance pending.

Builds on the verified restoration guard of Build 293. A temporary before/after CSS preview can otherwise be misleading if a fast-loading or virtualized Pornhub video list silently replaces or reorders cards during a scan while preserving exactly the same numeric tile counts and same-row gap counts.

The preview now captures strictly in-memory references to accepted `ul.videos` lists and their direct child objects and compares them after the temporary CSS is applied and again after removal. List swaps, reordered or replaced cards, a within-site route change, or fullscreen activated mid-preview return the existing `page-changed` result. Node identities are not transmitted to the dashboard, recorded, exported or retained after the synchronous call. A failed rollback still takes precedence and reports `restoration-incomplete`.

Five new focused test cases cover stable success, same-count replacement, same-count reordering, route/fullscreen changes, and test-registration/privacy guards. No new selectors, permissions, user controls, HTML rewriting, media handling, ad-blocking modifications, remote model or network telemetry. Existing compact CSS remains owner opt-in and OFF by default. The working Firefox paths and approved UI geometry are unchanged.

**Verification limits:** source inspected and isolate smoke checked before commit. Full native Ubuntu regression and real Firefox visual acceptance remain pending. This does not confirm the gap is gone on the live site.
