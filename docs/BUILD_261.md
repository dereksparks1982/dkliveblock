# Build 261 · v0.3.231: integrate remaining targeted MIT Facebook techniques; remove Nougat from site cards

## Owner-requested website change
Removed **Nougat Media Plus** from the "More from Elderred Softworks" cards in both `index.html` and `docs/index.html`. Only Hanafi Learning Deck, Folkhold, and Capital & Consequence remain. Regression fixture `tests/project-links-build253.test.js` updated to expect exactly three website links. No changes to the Nougat repository or application.

## MIT Facebook blocker integration
Based on the full vendored source `src/vendor/facebook-sponsored-upstream.js` and bundled MIT license, the DK-owned `src/facebook-ads.js` now additionally implements:

- **Marketplace**: sponsored card detection anchored on an explicit Sponsored badge or equivalent accessible menu within an individual listing tile. A parent with multiple independent listings is never hidden.
- **Mobile Facebook (html-renderer)**: bounded feed-child identification by width and render state rather than desktop ARIA landmarks, with a conditional IntersectionObserver recheck as virtualized posts come into view. Nonrendered placeholders are never hidden early.
- **Author position**: mobile Sponsored labels in quoted posts and body text cannot erase the enclosing organic post; Marketplace labels deep inside item descriptions cannot erase listings.
- **Ephemeral label rescue**: temporarily removed/adopted Sponsored text nodes with an ID are cached in bounded memory to match later `aria-labelledby` references. Ordinary text is never cached.
- **Safe ancestors**: corrected ancestor-loop advancement and allowed recognition of mobile feed and Marketplace grid boundaries without ever hiding those broad roots.
- Preserved previously integrated split-character/SVG label reconstruction, accessibility-menu matching, right-rail card resolution, reversible hiding, local count-only diagnostics, site exceptions and DK's own Meta module.

### Deliberately not imported as automatic rules
The upstream extension contains separate controls for suggested/unfollowed posts, whole feed sections, posts from unrecognized authors, unlabeled **shape-inferred** ads, and notification banners. Those aren't necessarily advertising, and enabling their upstream defaults could remove legitimate content. No wholesale second extension engine is activated; no new permissions or external dependencies.

### Verification
The following seven targeted regression scenarios were executed in an isolated JavaScript fixture:
1. Sponsored Marketplace badge hides its own tile and restores.
2. Ordinary Marketplace listings and body text mentioning Sponsored stay visible.
3. Marketplace grid itself cannot be selected as a listing tile.
4. Mobile Sponsored and Ad byline posts hide when rendered.
5. Mobile quoted Sponsored text, hidden virtual posts and ordinary posts remain.
6. Removed ephemeral Sponsored label caches its ID, while ordinary text doesn't.
7. Vendored MIT reference stays **unactivated** and original DK module remains in charge.

**Not verified:** full Ubuntu Node test suite, live Facebook feed/Marketplace/mobile/side-rail behavior in Firefox, GraphQL response interception, or all future Meta ad delivery mechanisms. Build 261 contains the selected MIT ad-specific integration, but cannot truthfully be called a universal or live-proven Facebook blocker. Do not call Facebook a PASS until a browser acceptance test.

## Owners and permissions
All changes committed directly to `main`; no new branches, Actions, downloads, changed approved geometry, telemetry, or automatic acceptable advertising.
