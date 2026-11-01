# Build 181: native/Ghostery priority reconciliation

**Unreleased:** 0.3.151 (2026-11-01).

## Proven filter verdict discrepancy
An independent V8 comparison of the actual bundled Ghostery engine and DK's hybrid matcher showed this valid subscribed combination:
```
@@||ads.example^$script
||ads.example^$important,script,domain=news.*
```
DK's partial native parser drops the second, entity-domain-scoped rule, leaving the first ordinary exception. The bundled Ghostery engine correctly selects the more specific `$important` block for `news.example`. **Before this build DK allowed that request.** This is a real decision disagreement in a synthetic rule fixture, not a live YouTube ad result.

## Change
- Preserve explicit user-created manual Allow/Block rules, site-page policies, and native important blocks.
- If the native matcher reports an ordinary exception, **still consult Ghostery**. Only if Ghostery selects a real matched, non-rewrite, non-redirect `$important` rule does that important block override the native ordinary exception.
- If Ghostery returns a valid exception, continue allowing. If Ghostery returns an ordinary block, or errors, preserve the existing native exception and fail safe. The change does not execute vendor scriptlets, external replacement bodies or CSP/HTML rewrites.
- Improve sanitized source attribution: Ghostery important subscription and approved inert redirects are identified explicitly rather than as opaque unattributed matches.

## Focused verification
Executed the current native engine, modified hybrid engine, real vendored Ghostery parser and source attribution module together in an isolated JavaScript harness: native exception allowed; Ghostery important rule matched; modified hybrid blocked; a different document site remained allowed; explicit manual allow remained effective; sanitized source label present.

Added `tests/hybrid-engine.test.js` cases for actual bundled Ghostery entity-domain important precedence, manual decisions and ordinary vendor block non-override, plus `tests/rule-provenance.test.js` privacy regression. JavaScript syntax parsed in the isolated harness.

**Not yet run:** full seven-phase Ubuntu suite; a clean-profile Firefox A/B test; live YouTube ad/anti-adblock scenarios; comprehensive uBlock comparison. This is a narrow, demonstrated correctness fix and no parity claim.

**Next Build 182:** broaden the evidence-based filtering corpus and add another vetted operation, preserving privacy and playback. No GitHub Actions or public release.
