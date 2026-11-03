# Build 325: Facebook scan fairness

**Version:** 0.3.295. **Status:** source-only, unreleased.

The existing Facebook full scan rotates its bounded work windows through articles, bylines and referenced portal/SVG labels. The earlier fixed-first windows could repeatedly skip a late post in a large DOM. Original window sizes, evidence gates, exception controls, 15-hide cap, geometry and network policies remain unchanged.

Five regression checks are registered in `tests/facebook-scan-fairness-build325.test.js`: 250th article detection, organic posts, empty lists, bounded byline/reference windows, and package/manifest consistency. A V8 mock smoke run succeeded before commit; **full native Ubuntu testing and Firefox browser acceptance are pending.** Verify genuine late feed Sponsored/Ad hiding and ordinary feed preservation after updating your local extension.
