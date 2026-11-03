# Build 306: Facebook late mutation-batch sampling
Date: 2026-11-03. Version: 0.3.276. Unreleased source on main.

## Observed problem and narrow change
The owner previously observed a visible Facebook Meta Glasses "Ad" post, with 0 blocked network requests and many allowed first-party requests. This does not establish why it survived, and Build 298's linked-author detector remains unverified in live Firefox. Code review revealed another concrete mechanism for ad flashes: content.js processed only the first 40 MutationObserver records in each callback. React can append the Sponsored marker in the tail of a larger batch; the immediate scan would miss it.

For Facebook only, the Meta adapter now supplies a chronological 40-record sample containing the first 16, eight evenly spaced middle records and the final 16. This is the same 40-record observer budget; the existing safe-card guards, actual evidence recognizers, disabled state, user exceptions, owner-scoped ads and periodic broad fallback are untouched. Other hostnames continue to use the original first 40 records. No network rules or player responses changed.

## Tests and repair
- Added six local Node regression cases: same-array safety/chronology, adversarial bounds, late real sponsored insertion through the existing Facebook scanner, disable/restore invariants in the fixture, unchanged other-site path, and prevention of hard-pinned historical version checks.
- Six old tests frozen at versions from Builds 294–298 were repaired to validate current version consistency or semantic-version shape without losing their feature assertions. This fixes false failures on each subsequent normal version bump.
- JavaScript syntax of updated source and new tests, and representative sampled batches, were checked in an isolated evaluator. Full native Ubuntu offline suite was **not** run and browser acceptance is still pending.

## Verification still required
Owner should retest fast-scrolled Facebook feed with organic posts intact and export the combined Build 305 Meta diagnostic if the same marked ad survives. YouTube ordinary-video refusal remains a distinct unresolved regression; do not claim resolution or alter previously working Free with Ads movie or Disney+ behavior.
