# Build 334: Marketplace single-tile safety

**Version:** 0.3.304. **Status:** source-only, unreleased.

The fast Facebook mutation scanner used general sponsored feed-card boundaries even on Marketplace, where tiles and grids have different structure. It now refuses fast hides on `/marketplace` URLs. Its existing scheduled full scan continues to use vetted `marketplaceTileFrom`/`marketplaceSignal` single-tile checks, without widening any selection criteria. Ordinary Facebook feeds retain their immediate fast path.

Five regressions distinguish Marketplace paths, feed and groups and ensure the owner-specific logic remains. No CSS geometry, permissions, network rules, telemetry, auth, YouTube or experimental GraphQL changes. The full Ubuntu suite and live browser test are still pending.
