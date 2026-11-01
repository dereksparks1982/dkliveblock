# Build 208: delayed user-authored scriptlet chains

**Version:** 0.3.178, unreleased. **Known-working YouTube rollback:** Build 203 (frozen tag `youtube-working-build-203-2026-11-01`).

## Problem

Claude observed that the new manually authored `set-constant` helper only handled intermediate globals which were already defined at `document_start`. A rule targeting `app.flags.enabled` could be skipped forever when `app` or `flags` first appeared milliseconds later.

## Implementation

- `src/safe-scriptlet-runtime.js` installs only fixed getter/setter functions for user-vetted properties and literal values. It observes a missing or not-yet-object intermediate property, retaining the site's original assignment semantics on read and saving the last assigned value. Once an object is assigned, it attempts to install the next part of the chain. Depth remains limited to three.
- On a watched intermediate reassignment, the helper restores downstream shims on the old object in reverse order before installing on the new one. Disabling the rule restores descriptors or page-assigned values. If the page itself replaces a property descriptor, teardown leaves that ownership alone.
- Existing object roots are traversed without unnecessary root interception, so two manual rules targeting separate already-existing child properties can coexist.
- Accessor-backed, inherited-accessor and unsafe property chains are not evaluated; missing non-extensible intermediates, locked leaves and dangerous path segments are rejected. No `eval`, remote script bodies, remote subscriptions, extra extension permissions or new bridge privileges.
- `tests/safe-scriptlet-runtime.test.js`: five new cases plus the five existing ones cover waiting, replacement, sibling rules, cleanup and getter avoidance.

## Limitations / acceptance

- Page MAIN-world events are forgeable by the page. They are not an authenticated extension channel and convey no extension privileges. Only the fixed, validated constant-setting capability is available. User-authored rule selection still occurs in the isolated background/content path.
- Simultaneous rules whose identical *missing* intermediate is first trapped by one rule may not both activate. This has deliberately not been advertised as full scriptlet compatibility.
- 10/10 focused synthetic tests passed; actual Firefox compatibility and complete Ubuntu test suite remain pending. Streaming and YouTube-specific code and previously tagged Build 203 are unchanged.

No public release or GitHub Actions were created.
