# Build 404 / v0.3.364: Named direct-node Facebook GraphQL collections

**November 13, 2026. Main-only internal development.**

Previously the first-party GraphQL rewriter filtered `edges` collections in several approved feed, search and Marketplace paths, but not equivalent direct `nodes` arrays. This meant positively identified sponsored units could slip through if the server returned an equivalent direct-node representation. We now include both forms within four explicit, previously supported GraphQL collection names. A direct node requires precisely the same ad metadata checks as an edge, with upper-case `_ADS` roles confined to search-result arrays.

The implementation deliberately does not traverse arbitrary or user-owned arrays, message content, profiles or root `data.node` parser decoys. It preserves Marketplace listing composer exclusions, side-feed wrappers, all old/new sponsorship markers, the 1,000-entry array ceiling, JSONL and RequireJS transaction checks, existing tab limits and user opt-out. No browser permissions, new dependencies, scriptlets, new telemetry or UI changes.

15 regression fixtures exercise simultaneous edges/nodes, legacy and renamed ad metadata, rendering strategy, upper-case search roles, ordinary content, Marketplace, oversized arrays, malformed/failed streamed responses, nested RequireJS and route protection. Full Ubuntu suite and signed-in Firefox verification remain pending.
