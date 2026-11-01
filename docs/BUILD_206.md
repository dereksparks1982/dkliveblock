# Build 206: safer high-volume network matching

**Unreleased development source:** 0.3.176 (November 1, 2026). **Observed-working rollback:** Build 203 / `8f4c6739ddba2cbb1a64918639d014ccf31a8f54`.

## Problem

Claude's independent audit measured roughly 200 candidate regexes checked per synthetic request and flagged unnecessary allocations from the native engine's `candidates()` hot path: a fresh array copying generic rules plus hostname and indexed-token buckets on every `checkRequest`. Scanning every URL 4-gram into a Set amplified allocations even if almost no token corresponded to an indexed rule. This is source-level and synthetic evidence, not yet production EasyList benchmark data.

## Changes

1. **Ordered visitor:** new `visitCandidates()` yields the same generic, descending host-suffix and first-encountered token buckets without creating a combined list. `checkRequest()` visits rules directly; the public `candidates()` function still returns an array in exactly the previous order for compatibility with existing tests/tools.
2. **Sparse token deduplication:** only URLs' 4-character strings actually present in `tokenIndex` are added to the seen-token Set. Repeated matches are still processed once, preserving exact prior order.
3. **Lower allocation host traversal:** iterates successive `hostname.substring(...)` suffixes rather than repeated `split/slice/join` arrays. Reuses a lowercased URL in the visitor and literal-matching fast path.
4. **Literal fast path:** ASCII unanchored filter strings without `*`, `^` or `|` can use `String.includes`; anchored, wildcard, explicitly regex filters and any non-ASCII request URLs use the existing `RegExp`. `compiled` regex is preserved on each rule and available as the authoritative comparison.
5. **Permanent differential tests:** `tests/engine-matcher-stream.test.js` includes the previous visitor and verdict selection algorithm as an independently coded reference. It compares 2,280 combinations of request types, page policies, origins, methods, wildcards, scoped exceptions, `$important`, literal patterns, case sensitivity, and popup handling. It also checks candidate order, legacy API, reloading, and Unicode regex fallback. The file is registered in `scripts/test-local.sh`.

## Validation and acceptance gate

- **Passed in a limited V8 test harness:** all 79 current rule tests plus five new matcher tests (84 total). The cross-verdict test checked 2,280 permutations with equal `block` and winning rule keys. This harness uses a simplified URL interface and cannot replace Node or actual Firefox.
- Syntax checks and Git tree diff still needed before committing. Full seven-phase Ubuntu suite, real subscription differential, and browser p50/p95 throughput/memory and streaming behavior remain unverified.
- No change to `src/youtube-*.js`, stream response hooks, player bridge, bundled Ghostery, permissions, UI layout, runtime dependencies, or GitHub Actions. Existing Build 203 backup branch and tag are not changed.

**Potential risk:** optimizing candidate traversal changes the implementation of a security-sensitive matching hot path. Preserve the old candidate-order regression tests; run the complete suite and compare on real lists before accepting this as a performance improvement.
