# Build 336: fast-path tail label coverage

**Version:** 0.3.306. **Status:** source-only.

The Facebook mutation fast scanner used only the first hundred descendant label elements of each changed subtree. Late-inserted Sponsored labels after a hundred unrelated spans were not considered in that immediate pass. Keep the existing hundred-node and 320-element total caps, selecting the first fifty and last fifty for long subtrees. Original feed/rail resolver, organic protections and exception logic remain unchanged.

Five standalone tests check head/tail coverage, short-list behavior, malformed inputs, fast-pass use/caps and version synchronization. Source smoke passed. Native Ubuntu/real Firefox tests pending.
