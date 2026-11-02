# Build 265 · v0.3.235: Facebook ad interception reliability

## Why this build matters
A Facebook GraphQL response can contain multiple JSONL records and arrive over time. Earlier development code could remove ads from one valid record even if another record was malformed or authentication-related, and its fixed four-second timer could end an otherwise active response. Changing Facebook responses is high risk, so this build strengthens the conditions under which DK will edit them.

## Changes

### 1. Atomic GraphQL/JSONL edits
- Parse and validate all non-empty records in a multi-record response before altering any.
- If a record is incomplete, malformed, an unsupported plain-text line, or reports a GraphQL error, leave the **entire** response intact.
- A top-level GraphQL error also prevents a nested `require`/`__bbox` envelope from being edited.
- Preserve original newline separators, unrelated objects, request context, and error details without storing or logging any private response content.
- Existing limits on recognized ad-bearing collections and permitted ad evidence from Build 264 remain.

### 2. Bounded response streams
- The four-second timer now measures **inactivity** and renews on incoming chunks.
- An independent 20-second absolute lifetime prevents a trickle stream from occupying a filter forever.
- Limit in-memory buffering to 2,048 chunks or 1.5 MB, whichever occurs first.
- On timeout or resource limit, emit buffered original bytes then disconnect the response filter. Unexpected/malformed UTF-8 remains byte-for-byte original.
- Counter-only local diagnostics remain; no remote telemetry, no request/response body retention.

### 3. DOM right-rail coverage
- Detect Sponsored aria-labels in buttons or links in the Facebook right rail, not just spans/divs.
- Existing right-side geometry and content-context guards prevent scanning ordinary main feed, contacts headers, or left-side controls.
- No automatic hide of entire Contacts or Messenger sections.

## Verification
- 9 Build 263 GraphQL tests, 8 Build 264 GraphQL tests, 3 Build 264 rail tests, and 14 Build 265 tests: **34/34 passed** in isolated JavaScript simulations.
- JS syntax validated for modified modules. Versions in `src/manifest.json` and `package.json` are both 0.3.235.
- The full `scripts/test-local.sh` suite was not run because the sandbox cannot reach github.com for a complete checkout. Live Firefox ads and first-party GraphQL schemas have not been evaluated.
- **`metaGraphqlFilter` remains false/OFF by default.** Do not call this feature a verified live ad blocker.

## Unchanged
- Existing DK filtering engine, subscriptions, privacy rules, the YouTube bridge, and cookie agents.
- The owner's approved 12-card public website layout, sound and project links.
- No GitHub Actions, third-party engine, external runtime dependency, new browser permission or prompt required.

## Next acceptance gates
1. Run the complete local suite and resolve the independent audit's reported red security-contract tests.
2. Test native DOM Sponsored recognition on the user's actual Facebook feed/sidebar/Marketplace, recording aggregate counts only.
3. Test opt-in GraphQL rewriting with current Facebook response fixtures and check interactions, reactions, Messenger and ordinary shopping listings.
4. A/B YouTube playback against the Build 203 known-good tag before declaring parity or release.
