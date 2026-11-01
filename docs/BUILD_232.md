# Build 232 (0.3.202): XNXX premium banner and Facebook ad integration

**Development build. Live Firefox verification pending.**

- XNXX: remove only the exact top-of-video "Try XNXX.GOLD" premium sales strip, with checks for the actual xnxx.gold link, narrow banner geometry and absence of any player, form or navigation. Existing right-side promotional panel filtering remains intact. Existing reported 5-6 second disappearance delay is not declared solved.
- Facebook: implement first-party, locally processed detection for sponsored feed cards and Sponsored right-rail sections using strongly identifiable byline text, accessible references, split-character/Unicode labels and SVG labels. Detect React content insertions and retain a small bounded cache of transient label IDs.
- Hard safety limits prevent hiding main/feed containers, unrelated rail sections, navigation, forms, dialogs and oversized posts; suggested/unfollowed content is deliberately not hidden just for being suggested.
- Both features stay reversible when site protection or recognition is disabled, or when owner-authored cosmetic exceptions are applied. No network filter rule, telemetry, other site's protection, UI geometry, GitHub Actions or external runtime dependency changed.
- Facebook methods adapted from Inky's MIT-licensed fb-sponsored-ad-post-blocker; original copyright and full MIT text included in src/LICENSE-FACEBOOK-MIT.txt (also licenses/facebook-sponsored-MIT.txt in the repository). DK Live Block original code remains under its own LICENSE.
- Added focused fixture tests to existing Node ad-recognition suite; performed source syntax and smoke checks before commit. Complete Linux suite and real Firefox site tests must still be run by owner; this is not uBO parity or a public release.
