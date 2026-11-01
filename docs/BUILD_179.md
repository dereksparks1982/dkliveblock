# Build 179: bounded hide-only :style() compatibility

**Unreleased source version:** 0.3.149 (2026-10-31).

## Goal
Reduce actual missing rule-language support compared with modern filtering engines, while avoiding unsafe list-driven JavaScript/CSS and keeping playback intact.

## Code
- `src/rules.js` now accepts **domain-scoped** `##selector:style(display:none!important)` and `#@#` exception forms, with harmless whitespace and trailing semicolon allowed.
- This is a deliberately **strict subset** of uBlock-style `:style()`. It maps an existing hide-only rule to DK's ordinary cosmetic selector pipeline. The standard per-site page policies, `$elemhide` and `$generichide`, selector exceptions, video-protection filtering and authentication safeguards continue to apply.
- Selectors must be bounded and simple. Explicitly disallow universal, whole-document, playback, form and `#movie_player` roots. Reject other CSS declarations, remote content, selectors with arbitrary executable-style syntax, generic global style rules, and negative-only domain lists.
- No arbitrary `:style()`, `:remove()`, HTML rewriting or dynamic downloaded scriptlet execution was added.
- `scripts/filter-coverage-audit.js` categorizes these as `native_style_hide`, accounting for the supported subset without falsely counting arbitrary styles as supported. Existing `unsupported_extended_cosmetic` category still reports rejected styles.

## Verification and measurement
- Executed the actual modified `rules.js` and `engine.js` in an isolated JavaScript harness: tests for site scoping, matching selectors, opt-outs, unsupported dangerous selectors and strict styling syntax passed.
- Added `tests/rules.test.js` and `tests/filter-coverage-audit.test.js` regression fixtures for hide-only style, equivalent ordinary selector exceptions, CSS rejection and correct audit counts.
- Inspected the shipped `filters/youtube.txt`: **19 accepted native cosmetic rules, 8 header/comment/empty lines**. This bundled file contains no newly accepted style rules, so it cannot establish a measured improvement to actual YouTube video ads. Downloaded EasyList/EasyPrivacy were not available to audit in this session; any broader support percentage is unknown.
- The complete seven-phase local Ubuntu Node/Python suite and live Firefox video checks were **not** executed. No performance, false-positive or YouTube parity claim.

## Licensing and constraints
Independently written, data-only parser. No uBlock GPL source copied. No extra permissions, new dependencies, GitHub Actions, public release, distribution artifact or user terminal commands. Previously approved UI unchanged.

**Next Build 180:** measure and improve subscribed network-filter parity in the hybrid engine, including exception, redirect-rule, method and unsupported operator behavior with real bundled Ghostery fixtures. Prioritize YouTube playback only when captured browser data identifies a specific breakage path.
