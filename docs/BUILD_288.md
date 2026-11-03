# Build 288 / v0.3.258: Pornhub empty-ad-gap layout reflow experiment
**Date:** November 2, 2026. **Branch:** `main`. **Status:** internal source milestone, off-by-default.

Adds a locally bundled, opt-in `DKLayoutReflow` module. It touches only verified-format Pornhub listing containers: `ul.videos` with two or more direct linked `li.videoblock` children. It requires all other direct children to be demonstrably empty, explicitly ad-marked placeholders. Then it attaches reversible classes and a small local CSS Grid stylesheet, with no HTML node moving, no video loading, no player alteration and no third-party scripts. Unsupported selectors, mixed content, different hosts, watch pages and detached containers fail open.

Settings receives a single checkbox within the existing video/cookie settings group, **OFF by default**. Existing site allowlist, `$document`/`$elemhide`, global pause and content refresh govern the module. Disable/pause restores the original classes/styles; no new browser permissions or popup geometry changes.

New registered Node tests cover hostname/path scope, ad-slot safety, reflow/undo, no duplication, unsupported layouts and settings/manifest integration. Browser acceptance is **not yet established**: Pornhub may have changed markup since the public `.videoblock` reference, and the reported two-thumbnail gap is not proven fixed until owner checks it.

Read [layout reflow design](LAYOUT_REFLOW.md). Future builds: precise markup-driven refinement, per-site preview, Nesty observation integration and broader negative-control evaluation. Earlier AI model research remains on roadmap.
