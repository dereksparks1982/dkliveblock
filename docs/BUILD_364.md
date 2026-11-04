# Build 364: complete Facebook engine performance and failure diagnostics
**Version:** 0.3.334. **Date:** 2026-11-04. **Status:** unreleased.

- Export cumulative rounded, capped aggregate scan/observer/retry time from the complete original engine's existing performance counters, without collecting or exposing Facebook text, URLs, identities or individual cards.
- Report inspected label-element counts and classified-but-unanchored labels, distinguishing the source of slow or missed ad hides.
- Add explicit inactive-observer triage when protection is authorized but document monitoring has not attached.
- Five targeted Node regressions validate fixed-key whitelisting and source contract; no online telemetry or permission changes.
- No conclusion about the owner's live 15–30-second ad delay until a browser diagnostic comparison is performed. Native Ubuntu suite pending.
