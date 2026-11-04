# Build 349: mobile fast-scan boundaries

**Version:** 0.3.319. **Status:** source-only, unreleased.

The immediate Facebook mutation fast path used desktop article geometry even on the mobile html-renderer feed, which has different virtualized post and author-row boundaries. Now it defers mobile content to the existing mobile-specific full scanner, just as Marketplace already defers to single promoted-listing resolution. Mobile automatic scans remain active, but they must use the safer dedicated post resolver. Desktop feed still receives immediate event-driven Sponsored detection.

Five tests cover mobile guard, desktop positive, mobile byline contract, Marketplace parity and version. Full Ubuntu and Firefox/Orion mobile acceptance pending.
