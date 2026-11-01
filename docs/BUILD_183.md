# Build 183: native entity-domain filter support

**Unreleased source version:** 0.3.153 (2026-11-01).

## Competitor parity gap
The embedded Ghostery network engine supports subscription patterns such as `domain=news.*` and `domain=~news.*`, but DK's native matcher silently dropped those entire rules. This also affected the independent user/manual-rule engine, which does not automatically inherit Ghostery's parser behavior.

Build 183 implements a conservative source-domain **entity shorthand** in DK's native network filter parser:
- Accept only a single DNS label followed by literal `.*` in the `domain=` or `from=` source-scope option, e.g. `publisher.*`. Mixed ordinary hostname and negated scopes remain valid.
- Match against the registrable site's leading label, not arbitrary string suffixes. `publisher.com`, `www.publisher.com` and `publisher.co.uk` match `publisher.*`; `publisher.evil.com`, `notpublisher.com`, and `publisher.example.co.uk` do not.
- Preserve exclusion semantics (`~publisher.*`) and ordinary positive/negative combinations.
- Keep `validDomains()` unchanged and strict for **URL/source validation and other trust-boundary uses**. `to=`, `denyallow=`, and destination-host controls still reject the shorthand.
- Do not broaden `$document`/page policy or `$removeparam` operations by this syntax extension.
- Keep manual Allow/Block decisions above list-derived decisions, and retain Ghostery's separate filtering engine.

## Differential verification
Executed modified `rules.js`, `engine.js`, `hybrid-engine.js`, and the *actual bundled Ghostery vendor library* in an isolated JavaScript harness.
For six source scopes tested against twelve website hosts (**72 comparisons**), the native and hybrid decisions agreed with Ghostery: **zero divergences** in the sampled matrix. Manual scoped exceptions and strict-vs-network-scope validation also passed.

Added permanent test coverage to `tests/rules.test.js`, `tests/hybrid-engine.test.js`, and `tests/filter-coverage-audit.test.js`. Updated two historical hybrid fixtures that assumed entity scopes would always be rejected, rather than leaving incorrect expectations after adding support. The offline audit now labels `native_entity_domain` separately and counts this supported subset; unsupported partial wildcards still remain unsupported.

## Limits and remaining work
This is a **safe, single-label** entity-scope subset. More complex entity and regex domains, arbitrary scriptlets, HTML filtering and many network options remain unsupported.
The 72 comparisons are synthetic behavior tests, **not** measurements against a fresh EasyList/EasyPrivacy download, and not Firefox video-ad tests. The full seven-phase Ubuntu Node/Python suite remains unrun on this exact commit.
Do not infer uBlock parity or successful YouTube preroll/midroll blocking from this work.

**Next Build 184:** prioritize a concrete network/filter mismatch from a larger rule corpus, expand vetted filtering behavior, and keep the current YouTube playback and privacy safeguards. No GitHub Actions, public releases, user-side install commands or third-party engine downloads.
