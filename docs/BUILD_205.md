# Build 205: native filtering correctness after independent Build 203 review

**Version:** 0.3.175 (unreleased, November 1, 2026). **Baseline:** tag `youtube-working-build-203-2026-11-01` at `8f4c6739ddba2cbb1a64918639d014ccf31a8f54` remains unchanged.

## Source-level fixes and reasoning

1. **Option-only filters (audit CF-2).** A syntactically valid rule such as `$script,domain=publisher.example`, `$popup,domain=publisher.example`, or `$removeparam=fbclid` now uses an implicit `*` match pattern. Previously `lastIndexOf("$")>0` treated the entire rule as a literal URL pattern so these valid rules never fired. Unsupported dollar-prefixed pseudo-rules still fail closed at parsing rather than inflate network coverage.
2. **Hostname-prefix indexing (audit CF-3).** Only domain patterns with explicit `^`, `/`, `|`, `?` or `:` hostname boundaries enter the exact-host index. Wildcards and boundary-less partial hostnames are instead indexed by ordinary URL tokens, so `||ad*.example.com^`, `||cdn*.tracker.net^`, `||adserver`, `||ads.example` and `||example.*/ads` are no longer lost. Exact `||ads.example^` host/subdomain and lookalike protection remains intact.
3. **Non-network rule syntax (audit CF-5).** Previously a handful of HTML filtering and scriptlet markup forms were erroneously accepted as network filters and counted as supported. The parser now rejects these, and `filter-coverage-audit` labels more of them unsupported in the appropriate category. This **does not enable** site-provided or remote JavaScript.
4. **Conservative aliases (subset of CF-4).** `$doc` → `document`, `$ghide` → `generichide`, `$ehide` → `elemhide`, `$popunder` → `popup`. These map into existing code paths. **Main-frame navigation blocking and `$all` are not enabled.**
5. **Signed URL safeguard (audit CF-11).** Add `x-amz-algorithm` to native filter-rule navigation cleanup's protected query keys. The separate privacy module already protected this field, but callers of the engine directly could rewrite it.

## Evidence and limits

- Focused source smoke checks passed all 79 `tests/rules.test.js` cases in a lightweight JavaScript runner with a simple URL interface; this is **not** the actual Node test runner or an exhaustive external-filter differential.
- Additional independent-audit scenarios cover the five mis-anchored filters, option-only network and navigation cleanup, unsupported markup, aliases and signed AWS algorithm key.
- No changes to the YouTube page bridge, media bytes, response rewriting, network request hooks, bootstrap logic, site UI, bundled Ghostery, permissions, GitHub Actions or the Build 203 tag. Newly active subscribed filters may alter sites, which must be tested before accepting this code.
- The independent reviewer reported 9 failing tests in its Node 22 environment. This build targets specific confirmed causes, **not** a claim that all nine failures are fixed or that DK matches uBlock Origin.

## Follow-up before release

Run the complete seven-phase Ubuntu suite, inspect current real filter-list verdict changes against Build 203, and collect clean-profile Firefox videos and authentication/popup tests. Add mechanism-specific, privacy-safe YouTube diagnostics in a separately audited build before attempting to change any ad-removal behavior.
