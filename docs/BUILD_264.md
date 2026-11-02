# Build 264 · v0.3.234: deeper Facebook Sponsored data integration

## Purpose
Continue the owner-requested Meta ad-removal work without replacing DK Live Block's filtering engine or declaring unverified compatibility.

## Concrete changes
1. **Explicit ad-bearing GraphQL collections:** `src/meta-graphql.js` can now remove individually evidenced sponsored records from `data.viewer.news_feed.edges`, `data.viewer.marketplace_feed_stories.edges`, `data.marketplace_search.feed_units.edges`, `data.serpResponse.results.edges`, and previously supported `data.viewer.sideFeedUnit.nodes[].new_adverts.nodes`. Specific evidence includes `category:"SPONSORED"`, known ad typename/role or `node.story.sponsored_data.ad_id` and search-renderer story `sponsored_data.ad_id`.
2. **Nested GraphQL transport:** Bounded traversal of Facebook `require` and `__bbox.result` wrappers, up to 20 levels and 1,000 nodes with per-array limits. This follows *transport keys only*, not arbitrary message/profile fields. The inner object still must match an explicit known feed collection and ad marker.
3. **False-positive protections:** Preserve ordinary Marketplace listings, message threads, reactions, comments, generic `sponsored_data` descriptors without an ad ID, and unknown sidebar units. Removed ad-only sidebar wrappers are limited to a known `AdsSideFeedUnit` with an emptied `new_adverts.nodes` array.
4. **Byte bounds:** Rewritten UTF-8 output (JSON and JSONL) must be at most 1.5 MB; otherwise the original response is passed through. Existing stream timeouts/concurrency, tab/session gate, and opt-in toggle remain unchanged.
5. **Right-rail DOM:** `src/facebook-ads.js` now lets bounded multi-span Sponsored labels reach its existing CSS-order-aware decoder. The scoped sidebar card resolver still protects Contacts headings.

## Scope and source research
Public uBlock Origin `uAssets` Facebook filter patterns were reviewed as a source of *response-schema examples*, not copied as GPL code. Reference:
https://github.com/uBlockOrigin/uAssets/blob/master/filters/filters.txt
Related false-positive/compatibility cautions:
https://github.com/uBlockOrigin/uAssets/issues/3367

This is a separate first-party implementation. The vendored MIT Facebook DOM reference remains inactive as a standalone engine. No new permissions, remote dependencies, accepted-ads feature, telemetry or visible layout changes.

## Test evidence
- `tests/meta-graphql-build264.test.js`: eight new synthetic schema/passthrough cases passed.
- `tests/facebook-rail-build264.test.js`: three synthetic sidebar cases passed after correcting the test DOM's body containment stub.
- Builds 263+264 combined: **20/20 focused isolated JavaScript cases passed** on current source, including streaming and settings gates.
- Manifest and package version synchronized at `0.3.234`.
- **NOT yet tested:** full `scripts/test-local.sh`, actual Facebook request-body schema in a live signed-in Firefox session, full scrolling/feed/Marketplace, Messenger reactions, long-session performance, or YouTube A/B.

## Acceptance / next steps
1. Run the full local test suite and resolve any failing security-contracts without weakening assertions to hide a real vulnerability.
2. Verify the Facebook DOM scanner before changing GraphQL settings; capture aggregate-only diagnostics from the extension to determine missed ad entry points.
3. On an owner-authorized throwaway/test Facebook session, cautiously evaluate opt-in GraphQL filtering with focus on Messenger, reactions, feed pagination and ordinary Marketplace listings. Turn it off immediately if anything breaks.
4. Only expand to further response shapes when captured examples demonstrate their existence and can be sanitized safely. Do not claim universal Meta ad blocking.

Versioned GitHub source updated, no GitHub Actions or terminal command required by the owner.
