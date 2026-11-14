# Build 403 / v0.3.363: Facebook sponsored metadata and Marketplace composer protection

**November 13, 2026. Main-only development build, not a release.**

This build adds one independently reported Facebook GraphQL feed-ad signal: the `CometStorySponsoredLabelStrategy` typed value found only at the specific `node.comet_sections.context_layout.story.comet_sections.metadata` collection in known feed/search/Marketplace edges. Detection requires the exact type in an object, not a text match, and refuses metadata collections larger than 24 entries. A separate search-only matcher accepts bounded uppercase roles ending in `_ADS` without hiding feed stories based on ambiguous roles. Earlier `th_dat_spo` support stays intact.

A November 8 uBlock Origin report described Facebook Marketplace item/bulk creation failures from aggressive JSON edits. Our own engine previously stripped an empty `AdsSideFeedUnit` wrapper after removing its ad children. It now retains the wrapper and the surrounding order, removing only ad child records. It also skips response modifications on confirmed Marketplace composer routes, with a narrow route matcher instead of stopping ad filtering for normal browsing.

15 new synthetic tests plus a revised legacy regression cover nested/JSONL feed, search roles, normal posts, typed paths, size bounds, parser-decoy safety, composer routes and wrapper retention. No new browser permissions, package dependencies, external scripts, privacy logging or UI changes. Full Ubuntu and live Firefox browsing/composer tests **not run**.

Research references (no GPL source copied): https://github.com/SysAdminDoc/facebook-ublock-filters and https://github.com/uBlockOrigin/uAssets/issues/3367.
