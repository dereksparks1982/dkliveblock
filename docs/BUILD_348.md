# Build 348: tail article fast scan

**Version:** 0.3.318. **Status:** source-only.

A changed Facebook React subtree may include more than eighteen article descendants. The fast path previously inspected the first eighteen and could miss an explicit Sponsored card at the end. A fixed bounded head/tail selector now examines the first nine and last nine, preserving all candidate proof, safety, root count and full-scan fallback. Normal posts are not hidden without explicit evidence.

Five synthetic tests check the sample, final Sponsored/organic article, malformed inputs and unchanged cap/manifest. Full Ubuntu suite and live Firefox test pending.
