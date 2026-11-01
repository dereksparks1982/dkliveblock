# Build 154: serialized YouTube prefetch player metadata

**Unreleased version 0.3.124, October 31, 2026.**

The Build 153 /youtubei/v1/resolve_url filter recognized a nested playerResponse only when it was an object. Some JSON envelopes may carry that exact playerResponse as a string containing JSON instead. Previously these known-format advertising fields could be missed.

The Firefox background response rewriter and local YouTube MAIN-world page bridge now accept the same nested playerResponse when its own value is a bounded JSON string containing a recognizable playable player object. Only the existing adPlacements/adSlots/playerAds properties are removed. Preserve streamingData, videoDetails, visitor/session, signed URLs and navigation data. Refuse malformed, too large, unknown or playback-denied values. On the page-world path, do not invoke getters or assign to read-only playerResponse properties.

Added tests for object/string equivalence, JSON/text fetch results, signed media preservation, GET exclusion, malformed/error/refused values and read-only property handling. No new dependency, remote scripts, permission change, UI movement, terminal command or GitHub Actions. The full Ubuntu Node/Python tests and real Firefox ad-free video acceptance remain release blockers; this is source coverage, not proven YouTube success.
