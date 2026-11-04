# Build 340: first cumulative fixture repair

**Version:** 0.3.310. **Status:** source-only, unreleased.

An isolated V8 test harness identified test-only failures after Builds 325–339. This repairs historical-version pinning in the affected fixtures, corrects the 250-post modulo cursor (230), fixes a wrong uppercase Russian assertion, corrects a rail cursor (5000) and replaces two incomplete mocked CSS priority objects so restore() can behave like a real browser. Production code and filters are unchanged.

Five new regressions cover these fixture contracts. Remaining integration test version freezes will be addressed next. Full Ubuntu Node suite and actual Firefox acceptance remain pending.
