# Build 213: constant-time Network Monitor eviction

**Unreleased:** 0.3.183, November 1, 2026. **Rollback:** frozen Build 203, commit `8f4c6739ddba2cbb1a64918639d014ccf31a8f54`.

## Problem

The voluntary per-tab Network Monitor retains at most 1,500 rows to constrain memory. Once full, both `record()` and `syntheticBlock()` evicted a row, then iterated every `byId` map entry looking for its request ID to delete. On pages issuing thousands of requests, every new record paid an unnecessary O(1,500) ID-map scan, though the oldest row was already known.

## Fix

- `src/request-monitor.js` stores the already-tracked request ID on its internal row via a private `Symbol` key. On FIFO eviction the old row's ID is removed directly from `byId`, avoiding linear iteration. Synthetic popup rows do not have a tracked ID, and are evicted without scanning.
- `snapshot()` continues to construct fresh plain objects containing **only** site hostname, resource type, status, HTTP code, coarse time, error reason and preexisting safe metadata. Internal Symbol IDs never enter snapshots, CSV or JSON diagnostics. There is no added telemetry, site storage or request payload access.
- Cumulative `seen` and per-state counts keep existing semantics, even after the 1,500-row history cap is reached. Late completions of already evicted IDs remain harmless and cannot update another request.
- `tests/request-monitor.test.js` adds two overflow tests: both forbid iteration of the ID Map, verify correct deletion of oldest IDs, stable allowed/block transitions and lifetime counts, and prevent export of private IDs/URLs. All eight focused tests passed in a lightweight JavaScript environment.

## Acceptance limits

Run the full Ubuntu Node/Python test runner and a real Firefox capture/performance comparison. No wall-clock speedup has been independently measured; the complexity reduction follows the changed source structure and controlled tests only.

No change to the YouTube bridge, player requests, request-filter decisions, permission set, UI layout, README, frozen Build 203 snapshot, or GitHub Actions.
