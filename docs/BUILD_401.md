# Build 401 / v0.3.361: Ghostery's licensed DOM-aware cosmetics, safely integrated

**November 12, 2026. Main-only development build; not a public release.**

## Real integration expansion
Ghostery `@ghostery/adblocker@2.20.3` (MPL-2.0) already provides a supported `getCosmeticsFilters` DOM-feature mode, using `classes`, `ids`, `hrefs` and `getRulesFromDOM`. DK previously requested only the initial hostname/base rules, missing ad slots which appear after hydration or lazy feed updates. This build activates that existing licensed capability instead of introducing another network engine or copying incompatible code.

## Privacy, performance and false positives
A new bounded source-only module reads short safe class and ID names. It never reads page content, hrefs or form fields. Each batch and collected set has independent work and memory caps. The existing content-side MutationObserver supplies the changes, and a delayed refresh reuses the existing background `getStyle` message. The background verifies the sender is the actual same-host Firefox top frame and validates features again. Ghostery scriptlets are ignored; static and dynamic CSS both pass through the established conservative sanitizer, native page and user exceptions, streaming protection and identity UI guards. The new path is disabled on Facebook and streaming sites until browser acceptance.

## Regression verification
New tests cover parsing bounds, deduplication, mutation updates, private-name refusal, upstream dynamic API arguments, user/site exceptions, vendor failures and manifest order. Source syntax and focused in-process checks can be run without changing the end-user install. No GitHub Actions workflow is needed or run. Full Ubuntu and visual Firefox site testing remain unverified, and parity with other blockers is not claimed.
