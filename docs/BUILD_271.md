# Build 271 / v0.3.241: Malformed nested Meta transport fail-open guard

This build extends the existing experimental Facebook GraphQL response safety checks. Within the recognized RequireJS transport tree, an explicitly present `require` must be an array, `__bbox` must be an object, and `result` must be an object; the same checks apply to `__bbox.require` and `__bbox.result`. A malformed nested sibling cancels all response edits, including edits proposed on previous JSONL records.

Seven focused regression cases were added to the existing registered `tests/meta-graphql-build270.test.js`; no new test runner registration is necessary. The code does not traverse arbitrary user data, change the Firefox/Orion website geometry, enable the Facebook GraphQL experimental setting, alter YouTube/streaming interception, add permissions, or introduce telemetry.

**Acceptance:** automated suite and real Firefox/Orion acceptance are pending. Source changes are committed but not a verified Facebook ad-blocking PASS. Version synchronized to 0.3.241 in manifest and package metadata.
