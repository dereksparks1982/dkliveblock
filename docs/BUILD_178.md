# Build 178: vetted Ghostery redirect integration

**Source:** 0.3.148, unreleased, 2026-10-31.

## Why
A source-level comparison of uBlock Origin, AdGuard and DK found that modern blockers apply redirect/exception rules as first-class filter decisions. DK already bundles the Ghostery MPL-2.0 network engine, but `src/hybrid-engine.js` silently discarded any Ghostery match containing `redirect` or `rewrite`. This made supported subscribed rules ineffective when DK's narrower native parser could not understand them.

## Implemented
- On a Ghostery network match with a redirect, read the **parsed filter's** `getRedirect()` only after confirming `isRedirect()`. Accept exactly:
  - `noop.js` for a `script` request, mapped to DK-owned `redirect/noop.js`
  - `empty.css` for a `stylesheet` request, mapped to DK-owned `redirect/empty.css`
- Return a bounded, safe `rule.redirect` verdict that the existing `DKRedirectResources.url()` adapter resolves to `moz-extension://.../redirect/...` in the request listener.
- Never use Ghostery's `redirect.dataUrl`, filename/body, a URL from a subscription, or a URL supplied by the webpage. Never execute filter-list scriptlets or arbitrary redirect resources.
- Existing manual block/allow decisions, subscription exceptions, page-policy allowances and popup/navigation bypasses continue to take precedence. Unsafe/mismatched redirects still fail open to the previously computed native verdict.
- No additional WebExtension permissions, bundles, download requirements, UI changes, or changes to YouTube's page-world/player JSON code.

## Evidence
- Ran the actual bundled Ghostery engine and DK's modified native/hybrid adapter in an isolated V8 harness. Ghostery provided `filter.getRedirect()` for a `noop.js` rule even when the underlying redirect payload used an opaque vendor stub.
- A native-unsupported but valid entity-domain rule (`||ads.example^$script,redirect=noop.js,domain=news.*`) previously produced no usable native verdict. The new adapter emitted `noop.js` for `news.example`, while leaving unrelated websites outside the scope.
- Checked script and stylesheet mapping, a native-recognized exception, wrong resource types, and rejection of an unapproved `noopjs` alias.
- Added regression tests for unsafe redirect payloads, exact resource/type mapping, manual precedence and real bundled Ghostery entity-domain matching.
- Changed JavaScript parsed successfully.

**Validation limit:** full seven-phase Ubuntu Node/Python runner and live Firefox/YouTube acceptance are **not** performed. This change improves rule-language coverage, but does not establish that ordinary YouTube preroll/midroll ads are blocked. The current user report still indicates incomplete YouTube protection.

**Next Build 179:** audit full subscribed rule syntax against the real Ghostery and DK parsers, identify highest-impact unsupported categories, and implement the next vetted, reversible feature behind explicit tests. Prioritize reproducible YouTube ad-breakage evidence over more speculative player rewrites. No GitHub Actions or public release.
