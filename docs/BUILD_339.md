# Build 339: tail-prioritized Facebook label mutations

**Version:** 0.3.309. **Status:** source-only.

The bounded fast path reserved twelve priority roots for aria-label/text changes, but still used their *first* twelve only. During a large attribute storm, late explicit Sponsored labels could be crowded out by prior unrelated labels before ordinary child insertions filled all 32 roots. When >12 urgent changes are present, select the first six and last six, preserving the prior work budget. All original post containment, explicit evidence and user exceptions remain mandatory.

Five regressions cover late ad, ordinary control, caps, short batches and version. V8 smoke tested a 40-record burst; native Ubuntu/real Firefox verification pending.
