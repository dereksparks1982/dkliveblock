# Build 210: shared late-property scriptlet observers

**Development source:** 0.3.180 (unreleased, November 1, 2026). **Known-working YouTube rollback:** Build 203 at `8f4c6739ddba2cbb1a64918639d014ccf31a8f54`.

## Problem addressed

Build 208 allowed manually authored `+js(set-constant,...)` paths to wait for a page object created after `document_start`, but different user rules such as `app.ads` and `app.tracking` could independently intercept the same missing `app` property. Only the first trap activated. This was a real correctness defect for a limited user-control feature.

## Implementation

- The fixed local MAIN-world runtime parses at most 24 vetted user selected rules into a shared prefix tree of no more than three property segments per rule.
- Each intermediate property receives at most one reversible shared getter/setter. When the page creates or replaces the object, all eligible descendant shims are installed on the new value and the old tree is unwound before the change. Page-assigned values are preserved on disable, and site-owned replacement property descriptors are not overwritten during restoration.
- Reapplying an identical configuration is now a no-op, preventing transient reinstallation on content refreshes. Existing read-only object properties may be traversed without altering those descriptors; inherited and accessor-backed paths are not dereferenced.
- The runtime uses only fixed literal constants and validated identifiers. Remote filter-list scriptlets remain disallowed; no eval, arbitrary code execution, network traffic, new browser permissions or UI changes.

## Validation and risks

- All 16 focused runtime tests passed in isolated JavaScript, including 6 new shared-prefix cases. Full Node/Linux suite and real Firefox behavior remain pending. These tests do not establish complete competitor scriptlet parity.
- MAIN-world DOM events remain page-forgeable; they provide no extension privilege, but expanding operations would require a stronger trust boundary. Complex property descriptor semantics and site-owned proxies need real-browser testing.
- No YouTube player, response rewriting, CSS, ad-recognition, streaming hook, or frozen Build 203 tag changed. Future development remains separate from the proven source baseline.
