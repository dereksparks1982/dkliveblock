# Build 172: safe literal attribute cosmetic filters

**Unreleased source v0.3.142 (October 31, 2026).**

## Added
- A limited, site-scoped `:matches-attr(name=value)` procedural cosmetic rule for identifying advertising elements through an exact literal HTML attribute value.
- Supports exact `#@#` / `#@?#` procedural exceptions and bounded, deduplicated per-site rules.
- The existing content script reuses its capped selector scan and safe DOM hide/restore logic. The matcher invokes `getAttribute` once, catches hostile page exceptions, and rejects huge values, regular expressions, script-like expressions, and generic site-free procedural actions.
- Tests cover parsing, quoted literals, exact exceptions, unrelated websites, false positives, and malformed/unsafe values.

## Deliberate limits
Only exact literal matching is supported; arbitrary regular expressions and the full uBlock Origin `:matches-attr` grammar remain unsupported. Other advanced scriptlet/HTML-response filtering features are not claimed. The existing YouTube JSON interception, playback, remote permissions, UI geometry and explicit request controls are unchanged.

## Test state and next build
The actual three modified source modules were loaded into an isolated JavaScript runtime and smoke-checked: literal matches, exception priority and regex rejection passed. The full seven-phase Node/Python suite and actual Firefox acceptance have **not** been executed.

**Next: Build 173.** Expand privacy-safe, site-scoped network-control diagnostics while checking for false positives, then capture full local regression evidence before public release. No GitHub Actions or user downloads.
