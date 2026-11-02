# Build 250 · v0.3.220: Facebook recovery and diagnostic acceptance milestone

- When Facebook's automatic scanner revisits a previously hidden card, it now restores that card if a newly active cosmetic exception matches the card **or its triggering Sponsored label**. Previously the scan only respected such changes when setExceptions ran.
- Added bounded scanner diagnostics (hidden count, short-label cache size, scan cursor, exception count), excluding page text, URLs, user identity and request payloads. The Meta adapter can expose these diagnostics to the existing content-side code without touching the established YouTube module.
- Added regression tests and performed syntax checks of updated Facebook, Meta, provider and content JavaScript using JavaScript compilation in the tool runtime. Full Node test suite and actual Firefox tests were **not** run.
- No new permissions, layout changes, ad allowlisting, network bypasses, external dependencies or GitHub Actions.

**Owner acceptance required:** Update existing extension, reload Facebook, scroll the feed and verify whole Sponsored cards and right-sidebar Sponsored units disappear without harming organic posts, Messenger, navigation, videos or other confirmed sites. If an ad survives, use the existing Ad Investigator and export its findings. Facebook is still **unverified**, not a claimed PASS.
