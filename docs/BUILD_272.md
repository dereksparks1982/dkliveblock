# Build 272 / v0.3.242: Orion reliability + Agent Nesty Meta 06

## Scope
- Orion-only exact-site pause validates every saved hostname, total list size, storage-change payload, and initialization ordering. A malformed, deleted or unreadable preference pauses cleanup conservatively and marks storage as unavailable. Storage failure disables the stale popup control until it is reopened.
- Orion's DOM scanner cannot restart from a late storage callback while a page is suspended in the back-forward page cache. Only a real pageshow can restart it.
- Agent Nesty Meta 06 recognizes **exact short** Sponsored/Ad labels on ID-bearing span/SVG targets whose visibility/style attributes change. Existing Facebook logic still requires a real, tightly bounded card/rail/byline before hiding anything. Ordinary sentences, unrelated elements, unbounded IDs, and arbitrary user content do not count as evidence.
- Existing native Firefox manifest, filtering engine, streaming behavior, website geometry, licensing and external dependencies are unchanged apart from version metadata. Meta GraphQL remains opt-in and OFF by default.

## Tests and acceptance
- New `tests/meta-orion-build272.test.js` adds focused VM/runtime and privacy/negative-control regression tests, registered in `scripts/test-local.sh`.
- Full seven-phase Ubuntu runner and real Firefox/Orion device acceptance are **not yet executed** by this build. No Meta or Orion live PASS claimed.
- Remaining experimental limitation: simultaneous Orion tab updates to the shared host-list key are not atomic. Do not claim this resolved until a tested storage strategy is available.
