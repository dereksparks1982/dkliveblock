# Build 292 / v0.3.262: Explicit, reversible before/after layout preview
**Date:** November 2, 2026. **Branch:** `main`. **Status:** source implementation; owner Firefox acceptance pending.

A new **Compare compact layout (temporary preview)** button appears only within the existing collapsed Pornhub Video Layout Repair section in Site Dashboard. Nothing runs automatically. It requires a confirmation dialog and a selected, actively protected Pornhub listing tab with the Compact Video Grids option **OFF**.

The extension reads only coarse in-page video tile geometry from the existing strict Pornhub `ul.videos > li.videoblock` pattern, temporarily attaches the already-vetted CSS Grid classes, measures the same aggregate four spacing numbers, then **restores the prior CSS/classes synchronously in a `finally` block**. It refuses unsupported/mixed lists, no comparable adjacent video pairs, global/site pause, active element picker, and pages already under the experimental grid. The preview never creates video elements, rewrites user data, fetches media, changes blocking rules, persists page data, or adds third-party dependencies.

The request passes a new **extension-origin-only, exact-tab, top-frame** background relay with protection policy checks and a post-request tab URL recheck. Only coarse local counts and Nesty's review-only interpretation return to the existing dashboard. Nesty labels improvements, worse gaps, no measured change, or incomparable states if video/tile rows changed. These are UI geometry observations, **not proof of ad removal or live browser verification**. No saved baseline is kept between pages or sessions, no external logging, no new browser permissions.

Six new registered regression cases cover reversible success, comparison states, mixed/disabled layouts, exception restoration and private authorization wiring. Full native Ubuntu suite and real Firefox Pornhub visual/interaction acceptance remain pending.
