# Build 326: late Sponsored portal label survival

**Version:** 0.3.296. **Status:** source-only, unreleased.

The Facebook DOM observer now samples six leading and six trailing child nodes when up to 12 detached or added nodes are examined for reference labels, rather than always the first twelve. This preserves fleeting explicit Sponsor/Ad evidence from heavily batched React updates, with no increase to traversal budget or changes to existing byline, source-reference and post boundary checks. An ID cache does not itself hide anything.

Five tests cover head/tail selection, short batches, late portal caching, normal text and malformed input. A V8 scenario was evaluated; native Ubuntu suite and Firefox acceptance remain pending. No new permissions, network rules, UI geometry, telemetry, video changes or GraphQL default changes.
