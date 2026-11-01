# Build 166: reproducible offline filtering-engine performance baseline

**Unreleased 0.3.136 (2026-10-31).**

`scripts/engine-performance-audit.js` is a deterministic offline Node benchmark for DK's native engine and the current hybrid Ghostery engine. It uses bounded generated `.perf.invalid` domains and image requests, not real browsing traffic or downloaded filters. It reports median parse and batch request-matching time in milliseconds, a coarse process-heap delta (explicitly not attributable precisely to either engine), and the synthetic workload size.

`tests/engine-performance-audit.test.js` checks benchmark fixtures, size boundaries, median calculations and sane timing results. It is registered in the local seven-phase regression runner. The heavier full benchmark is **not** run automatically by the tests; that requires executing the standalone script on an appropriate local Linux runtime.

This is a benchmark instrument, not evidence of real-world Firefox speed, CPU overhead, or parity with other blockers. No changes to live filtering, permissions, network behavior, developer panel geometry, or source licensing. No downloads, GitHub Actions or public release; full local suite and browser acceptance remain pending.
