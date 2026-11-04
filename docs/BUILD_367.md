# Build 367: enforce a single complete Facebook engine

**Version:** 0.3.337. **Date:** 2026-11-04. **Status:** unreleased.

- Remove the legacy partial Facebook DOM scanner fallback from the active Meta module. When the licensed full Facebook core is missing, refuse automatic Facebook feed hiding instead of silently running partial behavior.
- Report coreMissing explicitly in local Facebook diagnostics, with user-facing triage that identifies an incomplete installation rather than implying zero observed ads.
- Add five executable adapter tests including a deliberately throwing legacy scanner to prove the full core has sole ownership; retain other Meta observation-only modes.
- Extend the read-only source auditor to reject accidental restoration of the partial fallback and register the new test suite.
- Retain all ten complete MIT feature paths, site pause protections, privacy and existing UI geometry. Full Ubuntu and Firefox acceptance pending.
