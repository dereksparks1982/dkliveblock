# Build 402 / v0.3.362: New Facebook GraphQL ad field support

**November 12, 2026. Main-only internal development.**

Recent October 2026 research identified `th_dat_spo` as a renamed advertising metadata field within Facebook's own feed responses. DK's prior GraphQL engine matched the older `sponsored_data` but missed this alias. The first-party reimplementation now checks the new field **only** in the previously established feed/search/Marketplace/side advert collection paths, with a strict affirmative type or bounded ad-ID gate. The historical matcher contract is preserved.

The JSONL/RequireJS pipeline already recognizes approved first-party GraphQL envelopes and remains responsible for processing these newly recognized items. It fails open for malformed, oversized and error-bearing responses; it never alters arbitrary root `data.node` or Facebook's `SponsoredData` JSON parser decoys. Existing settings permit the owner to disable the Meta Nesty 05 GraphQL experiment at any time. Neither the uBlock GPL scriptlets nor third-party source code was copied. No new permission, dependency, UI, streaming-player or Ghostery change.

Fifteen synthetic tests cover new fields, preservation of unrelated user data, legacy ad markers, GHL parser decoys, errors, JSONL line endings, RequireJS nesting, size bounds and opt-out. Actual Ubuntu full-suite and logged-in Firefox acceptance have not yet run. Reference research: SysAdminDoc/facebook-ublock-filters and pyxis3-ai/webcleaner.
