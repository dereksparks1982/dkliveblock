# Build 163: exception-aware filtering with explicit user priority

**Unreleased 0.3.133, 2026-10-31.**

## What changed
- `src/hybrid-engine.js` now consults bundled Ghostery on ordinary native subscription blocks and honors its reported exception instead of blocking prematurely.
- Separate native parsing of explicit custom user rules (when supplied) gives manually authored block or allow rules priority over subscription decisions.
- `background.js` passes user custom rules to that manual-priority engine on recompilation. Explicit per-tab and per-site controls remain in the existing background request flow.
- The original $important native blocking, page $document/$genericblock policy, explicit popup-only filter handling, and main-frame bypass remain unchanged for safety.
- Redirect/rewrite results are not executed from third-party filter data. A vendor failure returns the previous native result.
- Tests cover native subscription rescue, custom allow/block priority, retained $important behavior, fallback, and request method forwarding.

## Limits
This build repairs a documented precedence failure mode, not the entire filter-language gap. The dual parse and the restrictions on main-frame, redirect and scriptlet behavior remain until independently tested. Source syntax and standalone mock arbitration were checked while authoring. The full Linux test suite and live Firefox behavior remain unverified, so no parity or video-playback claim.

**No GitHub Actions, public release, browser launch, packages or terminal work for the user.**
