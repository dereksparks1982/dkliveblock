# Build 214: manual scriptlet self-repair on unchanged configuration refresh

**Version:** 0.3.184, unreleased. **Preserved known-working YouTube baseline:** Build 203 at commit `8f4c6739ddba2cbb1a64918639d014ccf31a8f54`.

## Problem

An explicitly user-authored, MAIN-world `set-constant` shim can be bypassed accidentally when the website itself redefines a configurable property with `Object.defineProperty`. Build 210 correctly avoided repeatedly reinstalling unchanged configurations, but it never noticed that one of its intercepted properties was gone. An ordinary extension refresh then left the rule ineffective until the user disabled/re-enabled it.

## Fix

- `src/safe-scriptlet-runtime.js` now checks own descriptors by `Object.getOwnPropertyDescriptor` without invoking page getters. Installed shims must still have the same getter/setter functions. An unmodified readonly intermediate node must still refer to the same object.
- On a subsequent settings refresh with unchanged rule text, the runtime keeps intact shared-prefix trees without resets. If a site has replaced a descriptor, it restores remaining old child shims, preserves site-owned new descriptor content, and attempts to install appropriate new shims using the same validated rule tree. Missing root watchers can also retry on later refresh.
- `tests/safe-scriptlet-runtime.test.js` adds three regressions: leaf descriptor overwritten by page; shared intermediate overwritten without setter; readonly intermediate updated with a new value. All 19 focused runtime tests passed.

## Security boundaries and acceptance

- This is still a fixed, nonprivileged, user-authored property shim. No remote subscription JavaScript, new scriptlets, `eval`, network traffic, new browser permissions or extra page-to-extension capabilities were added.
- The page can forge MAIN-world DOM events, so this mechanism cannot authenticate extension instructions or prove a page was protected. It is deliberately unsuitable for privilege-changing operations.
- Full Ubuntu Node/Python suite and real Firefox playback and manual-scriptlet behavior remain **unverified**. No changes to YouTube-specific ad-removal logic, UI geometry, README, or Build 203's permanent backup.
