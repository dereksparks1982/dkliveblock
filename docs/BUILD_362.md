# Build 362: fail-closed Facebook preference and authorization integrity
**Version:** 0.3.332. **Date:** 2026-11-04. **Status:** unreleased.

- Stop complete Facebook filtering when browser.storage.local.get rejects or returns invalid data; never interpret failure as permission to apply upstream defaults.
- Record settingsReady/settingsError as aggregate-only diagnostics, distinguishing inactive policy, loading and storage errors.
- A failed DK getStyle refresh now explicitly disarms the Facebook engine, to prevent stale authorized state after site pause or an extension-background failure.
- Five offline Node regressions cover successful/failed preference loading, triage, authorization-failure safety, full source and version.
- No added permissions, changes to other Meta sites, new public release or GitHub Actions.
- Native Ubuntu suite and real signed-in Firefox remain unverified.
