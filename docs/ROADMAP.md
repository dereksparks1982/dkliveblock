# DK Live Block: feature and release gates

Status: UNRELEASED. Do not claim ABP feature parity or verified video ad blocking.

## Development slices
- [x] Public repository and project identity
- [x] Independent blocking engine, page exceptions, element hiding, regression tests
- [x] List subscriptions and automatic updates (EasyList, EasyPrivacy)
- [x] Optional cookie, social and annoyance lists and opt-in multilingual cookie rejection assistant (limited and conservative)
- [x] Per-site pause, rule picker, undo and private bounded request logger
- [x] Settings import/export and local privacy controls
- [ ] Advanced ABP filters, snippets, redirects and robust procedural cosmetics
- [ ] Public Suffix List, performance and security hardening
- [ ] Real Firefox/Ubuntu site tests, YouTube pre/mid-roll and Disney+ playback
- [ ] Mozilla signing and explicit release authorization

### Constraints
Never advertise a package for download before it meets the user's ABP-or-better requirement. Avoid misrepresenting unsupported filters as working. Keep video playback intact if an advertising rule would break the player.

## Completed development checks

- Automated regression tests are maintained locally; earlier CI results are historical only.
- Mock Firefox runtime verified seeded request blocking, tab counters, request-log isolation and site pause.
- GitHub Actions removed at user request. Run `bash scripts/test-local.sh` locally before publishing any slice.

## Important unfinished items

- Advanced ABP compatibility: scriptlets, redirects and many procedural syntaxes.
- More robust third-party site categorization using a full Public Suffix List.
- Actual Firefox browser performance and video playback testing, especially YouTube and Disney+.
- Real list-download verification and long-duration memory/performance measurements.
- Mozilla signing, security review and stable release approval.

## Non-negotiable cost constraint

- Do not add, enable or trigger GitHub Actions. Tests are local only.
- Repository pushes store source, not hosted builds or deployments.
- No finished download until ABP-or-better equivalence is verified.

## Latest offline checks

- Added conservative popup handling, query-parameter cleanup, secure custom subscriptions, manual request-log exceptions, multilingual cookie rejection and two limited procedural filter modes.
- Added a synthetic 45,000-rule benchmark to the offline Node.js suite. Full browser profiling and ABP parity are **still unfinished**.
- No `.github/workflows/` files are permitted or present.

- [x] Conservative anti-adblock popup detection, optional toggle, reversible hiding and offline classification tests. **Live streaming behavior remains unverified.**

- [x] Add conservative subscription overlay detection for already-loaded articles, independent on/off setting and local regression tests. Not a server-side paywall bypass; live site effectiveness is unverified.

- [x] DK Network Recovery: opt-in selective SOCKS5/HTTP(S) routing, image-only and domain modes, DNS diagnostics, no bundled proxy provider, offline tests. Actual proxy/DoH/Firefox connectivity and restricted-network scenarios remain unverified.

- [x] Local-filter-list download streaming size limits and stricter content-script message authorization. Security regressions run offline. IMPORTANT: Firefox proxy.onRequest does not offer guaranteed fail-closed connectivity; do not market network routing as leak-proof.

- [x] Expanded partial ABP network options with `from=`, `to=`, and `denyallow=` and strict domain validation. No unsupported script execution.

- [x] Conditional filter updates with cache validators and 304 preservation, avoiding unnecessary transfers where servers support it.
