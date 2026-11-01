# Build 161: honest local regression gate

**Unreleased version 0.3.131, October 31, 2026**

The independent read-only review of Build 158 identified three test failures rather than proven runtime failures. This build corrects those precise regressions:

1. `tests/navigation-integrity.test.js`: native navigation cleanup already preserves signed links; update the obsolete test to assert `null` rather than a rewritten signed URL.
2. `tests/privacy.test.js`: explicitly initialize `DKRules` before requiring the engine in its isolated Node test process.
3. `tests/reliability-contract.test.js`: fix the `#banner` procedural exception to match the original element selector.

`scripts/test-local.sh` no longer stops after its first failing phase. It attempts all seven existing phases, runs all six Linux companion scripts individually, prints per-phase status and aggregate TAP test counts (pass/fail/skip/todo/cancelled), and returns nonzero if anything fails. It does not open a browser, contact hosted CI, or create packages. `tests/test-local-runner.test.js` creates a disposable synthetic checkout with fake Node/Python executables to verify both a successful run and multiple simultaneous failures.

**Verification limits:** Three patched JavaScript test files and the synthetic runner test parse successfully. Runner inventory checks include 112 unique Node test filenames and both concurrency-limited Node phases. Neither the complete Ubuntu suite nor live Firefox/YouTube/Disney+ playback has been executed or accepted in this build session. No parity/release claim.
