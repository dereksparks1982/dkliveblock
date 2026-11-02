# DK Live Block Build 234 / v0.3.204

**Source status:** main-only repository update. Facebook LIVE TEST NOT YET ACCEPTED.

Research references: `uBlockOrigin/uAssets` Facebook quick fixes (GPLv3; use concepts not unlicensed wholesale code), and `browseraddonsupport-wq/fb-sponsored-ad-post-blocker` (MIT; attribution retained through bundled license). `AdguardTeam/AdguardFilters` offers additional GPLv3 examples for future comparison. Ghostery integration is unchanged.

## This build
- Recognizes Facebook sidebar advertiser-linked anchors through exact `rhcad2` targets, `privacy_sandbox/comet/register/?eid=` attribution, and **complete** ad campaign parameter sets. Rejects ordinary links and abbreviated UTM patterns.
- Constrains removal to compact right-column containers. Feed, contacts, navigation, login and dialog roots remain protected. CSS hiding is reversible and respects site exceptions.
- Avoids rescanning computed styles on arbitrary Facebook content by decoding CSS-split "Sponsored" only on structurally plausible short character spans, preserving class-count decoy variants.
- Examines short author-level Ad/Sponsored bylines as additional evidence on post structures without the older article markers; does not hide every post containing those words.
- Adds regression fixtures to the existing test suite and updates documentation and version contract.

## Validation
- Seven selected Build 233 and new Build 234 JavaScript test cases executed in isolation using GitHub-sourced current code: PASS. Source syntax verified by JavaScript compilation. The complete Ubuntu seven-phase suite and Firefox UI tests have NOT been run in the assistant environment.
- Facebook remains FAIL until the owner sees the ads disappear. Existing proven sites and approved website controls are unchanged.
- No new dependencies, remote code, data upload, GitHub Actions or off-main branches.
