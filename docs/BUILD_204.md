# Build 204: protect last-good lists and fix manual scriptlet selection

**Unreleased development:** 0.3.174, November 1, 2026. The user-observed-working YouTube baseline remains Build 203, commit `8f4c6739ddba2cbb1a64918639d014ccf31a8f54`.

## Changes

1. **Conservative filter-subscription retention:** Previously the update guard could mistake a replacement list filled with hundreds of server outage sentences as healthy because it compared only the number of non-comment lines. The guard now rejects a catastrophic disappearance of recognizable ABP/EasyList-style rule markers when replacing a substantial, structured cached list, even if the incoming document has many lines. It additionally recognizes HTML, XML or JSON error fragments after a plausible filter header. No private rule strings are included in guard results. Legitimate small custom subscriptions and rules that Ghostery alone understands remain possible. This protects adblocking availability during subscription provider outages.
2. **User-scriptlet precedence and runtime limits:** Resolve site-level/manual exceptions before selecting the first 24 fixed locally bundled property shims; a user can no longer exhaust all available slots with excluded entries. Only one shim is selected for each property path to avoid last-write shadowing. Remote subscriptions cannot enable scriptlets.
3. **Regression tests:** New tests demonstrate the two prior defects, retention of normal updates, privacy-safe reporting, exception capacity, duplicate property paths, and frozen test version. No new Firefox permissions, GitHub Actions, dependencies, UI moves or YouTube request/player logic.

## Risk and remaining gate

- The new guard may reject a legitimately wholesale rewritten list from a structured ABP form into plain substring rules. It deliberately retains the last working cache rather than silently losing protections. The user can remove/re-add a list if necessary.
- Scriptlet precedence in a conflicting same-property configuration now follows first eligible rule (previous runtime would replace the earlier property shim with a later value). This affects **manually authored** scriptlet conflicts only.
- Syntax and focused unit checks are planned in staging. Full Ubuntu suite and live Firefox checks are pending. Do not claim new version is accepted, or uBlock parity.
