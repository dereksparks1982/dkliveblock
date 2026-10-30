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
- [ ] Finish the remaining performance and security hardening (the full Public Suffix List is integrated).
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
- Keep the bundled full Public Suffix List snapshot updated from the official source and validate its matching behavior.
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

- [x] Hostname-indexed cosmetic/procedural lookup and offline 52,000-rule scaling gate.

- [x] Debounced DOM-mutation observation for late popups with a 15-second scan fallback; preserve bounded checks and reversible hiding.

- [x] Optional, explicit proxy connectivity probe with safe destination validation, no cookies, no automatic background probes and a visible route-policy warning. Real proxy tests still pending.

- [x] Strict validation of persisted settings, custom subscription URLs and downloaded filter caches; bounded local cache restoration and recovery from damaged storage.

- [x] Additional conservative regex safety checks, 16 KiB URL matching cap and no routing of single-label intranet hosts through the image proxy.

- [x] Conditional proxy listener registration: no interception when routing is disabled, hostname-limited filters for domain mode, unregister on disable/pause and guard against unavailable APIs.

- [x] Toolbar failed-resource indicator and Network Recovery shortcut, keeping existing blocking and picker controls.

- [x] Reject HTML error bodies and non-HTTPS final redirect destinations for filter subscriptions; preserve last-good cache and report errors.

- [x] Curated multi-level ccTLD and private-hosted-domain suffix improvements, with third-party classification regressions. The full PSL snapshot is now integrated; keeping it updated remains a release-maintenance task.

- [x] Complete offline Mozilla Public Suffix List with ICANN and PRIVATE rules, wildcard/exception matching, IDN normalization, and MPL-2.0 compliance. Future updates: refresh from canonical publicsuffix.org URL, rebuild locally, retest.

- [x] Streaming safeguards: targeted YouTube skip-button handling, click throttle, player-safe cosmetic filters and element-picker exclusions; no stream manipulation or DRM changes. Real YouTube and Disney+ playback tests pending.

- [x] Build 16 late-notice improvements: AP and YouTube phrase recognition, attribute-change detection, debounced scanning, SPA navigation refresh, regressions against ordinary articles and donation forms. Live site effectiveness pending.

- [x] Build 16 optional per-streaming-site Playback Rescue: allow only the `media` resource type; default off, toolbar toggle, validation, persistence, backup and regression tests. May also allow video ads. Full playback verification still open.

- [x] Additional Build 16 content-script DOM regressions for ad-skip throttling, site/feature guards and SPA refresh, plus media-wrapper picker protection. Browser/streaming acceptance remains open.

- [x] Build 17A shared overlay lifecycle: reversible hide/re-hide, bounded tracking and adjacent backdrop handling with player/article controls excluded. Browser-level acceptance pending.

- [x] Build 17B per-modal article-body evidence and localized subscription wording, with regression tests against non-article dialogs.

- [x] Build 17C optional site-only popup cleanup pause: preserved ad/tracker blocking, cross-frame host binding, persistent preferences, toolbar toggle and settings backup.
