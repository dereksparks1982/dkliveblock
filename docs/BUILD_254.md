# Build 254 · v0.3.224: Meta delivery inventory and Facebook post-boundary fix

**Facebook engine:**
- Replaced a naive count of all `[aria-posinset]` descendants with a bounded independent-post check. A single sponsored article may contain nested list positions; two separate feed articles still prevent ancestor-level hiding.
- Prefer an explicit `role=article` or FeedUnit landmark over a generic `aria-posinset` when resolving a Sponsored menu or label.
- Recognize an exact two-character `Ad` label split across two leaf spans, without performing computed-style checks on generic two-child wrappers.
- These changes retain original bounds, owner exceptions, reversible hiding and the separate rail protection.

**Delivery mechanisms:**
- New read-only `src/meta-delivery-catalog.js` with 24 mechanisms and paired signal/context evidence requirements.
- Integrated inspection API into existing `src/meta-module.js` and an expandable inventory on the existing Meta Intelligence viewer (no rearranged approved controls).
- Separate matrix: `docs/META_DELIVERY_MATRIX.md`. Inventory entries produce review/observe findings, **never auto-block**.
- Added regression fixtures for two-character labels, nested list positions, independent feed post boundaries, and catalog routing.

**Verification:** Modified JS passed syntax evaluation, and isolated in-memory smoke checks confirmed split Ad label detection, nested/sibling feed boundary handling and strict evidence pairing. The Node test suite and Firefox live ad-blocking test were not run. This is a *candidate* improvement, not a claim that Facebook is beaten. Prior accepted YouTube behavior remains intentionally unchanged. No new permissions, GitHub Actions, branches, external engines, credentials, telemetry or UI rearrangement.
