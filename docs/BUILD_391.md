# Build 391 / v0.3.351: Facebook portal reference cycle protection

**Development build, November 4, 2026.** The complete MIT Facebook detector introduced in Build 359 remains the implementation of record.

## Real issue addressed
The upstream-inspired `resolveViaReferrer` recursively invokes `processLabel` on an ARIA/SVG referrer. A pair of mutually referencing ephemeral portal labels can call back and forth until the stack overflows or stalls the feed. Without a bounded in-flight set, DOM cycle detection is not guaranteed.

## Integration
The existing licensed Facebook implementation is retained rather than replaced. An eight-hop stack-local guard refuses a previously visited node, rejects self-links and malformed selector queries, and releases references with `finally` even if a downstream handler throws. This reuses the established label decoder, 50 ms recovery and whole-post safety checks. No additional document observer or site permissions are added.

## Evidence
New self-contained Node tests directly execute the actual extracted production function with mocked portal graphs. Full native Ubuntu and real Facebook acceptance remain pending. No public release or company-wide ad-removal claim.
