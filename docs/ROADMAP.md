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

- [x] Build 17D in-memory, capped popup-cleanup counter with content-script-only message validation and tab lifecycle resets; no popup text or URLs stored.

- [x] Build 17E hardened popup safety: account/password/payment/CAPTCHA exclusions, mutation triage and stale-refresh protection, with offline regression cases. Live Firefox acceptance still required.

- [x] Build 17E keyboard focus release for hidden overlays, 29 targeted popup regression checks, and a more realistic DOM mutation simulation. The complete local suite and actual Firefox browsing remain release gates.

- [x] Build 17 account compatibility: protect real Google/federated sign-in dialogs, explicitly recognized OAuth popup windows and narrow login-critical requests; retain unrelated ad blocking. Requires real Firefox login-flow verification.

- [x] Account-safe cosmetic/procedural filtering: protect Google Identity Services login controls and picker UI without disabling normal advertising rules.

- [x] Versioned, hosted data-only YouTube cosmetic pack, strict allowlist validation, daily/manual checks, conditional caching, previous-version rollback, rejected-version hold and maintenance documentation. Real streaming performance and ad-removal success remain unverified.

- [x] Build 18 settings repair: independent YouTube update toggle saves correctly, status reflects it, and update errors survive restart. No hosted CI or mandatory build gates.

- [x] Optional Patreon support buttons in popup and settings, disabled until the official creator page is created; URL validation, no tracking/paid tiers and offline tests.
- [ ] Review future license terms: anyone, including businesses, can use DK Live Block free; the project's desired restriction is resale/monetization of DK Live Block itself, not business use. Existing MIT permissions remain effective for versions already distributed.

- [x] Build 19 optional Ghostery MPL-2.0 engine bridge and local-only bundle compiler, with native fallback, rule arbitration and offline tests. Download/build of third-party dependency and real browser validation remain pending.

- [x] Build 19 conservative automatic DOM ad recognition: labeled slots, GPT/Google ad markers, bounded scanning, reversible hiding, player/login/article safeguards and offline cases.

- [x] Build 19 independent opt-out for automatic ad slot recognition, with restoration of its own hidden DOM elements, persistent settings and optional UI control.

- [x] Build 19D reuses compiled filter engines when subscription rules have not changed; works with native and optional Ghostery engines, with regression coverage.

- [x] Source-integrated Ghostery 2.20.3: bundled 479,492-byte engine committed to GitHub with MPL-2.0 notice; Firefox end users never install npm or separate dependencies. Real Firefox streaming tests still pending.

- [x] Build 20A: avoid redundant Ghostery decisions, enforce popup-only provenance, respect page exceptions; protect YouTube Skip Ad controls and stale-control cooldown; test with no hosted CI.

- [x] Build 20B: YouTube data-only compatibility pack v2, additional mobile/desktop ad containers, internal development version 0.2.1. Firefox playback remains unverified.

- [x] Build 20C: bring background regression mocks up to the actual embedded-engine loading order; simulate a browser-like TextEncoder/TextDecoder and isolate list-cache network tests.

- [x] Build 21: player-specific mutation watcher, debounced ad-skip checks with periodic fallback, YouTube-nocookie embeds, recycled Skip Intro protection, player-safe procedural cosmetics and focused watcher tests.
- [ ] Build 21 acceptance: run full repository regression suite, then real Firefox YouTube preroll/midroll and Disney+ playback tests. No release before those gates.

- [x] Build 22: static official-link dependency catalog, separate recommended-applications section, optional native messaging permission, read-only Linux companion protocol and safe per-user installer; no automatic third-party tool installs.
- [ ] Build 22 acceptance: complete offline suite, actual Firefox optional permission and native companion checks, and a user-friendly signed Linux companion distribution.
- [ ] Future: verified tool downloads and updates with explicit consent, provenance/signature verification, yt-dlp video downloads, local save-for-later video library.

- [x] Build 23: opt-in managed yt-dlp pinned Linux x86_64 install/removal with GitHub release hash verification, restricted redirects, no overwrite, no arbitrary URLs/commands, local offline regression tests and separate UI controls.
- [ ] Build 23 acceptance: full repository tests and live Ubuntu Firefox native messaging installation, constrained browser-packaging checks and network download test; no public release.
- [ ] Future: signed companion installer for ordinary users, automatic verified updates, FFmpeg integration, actual yt-dlp video downloading and save-for-later library.

- [x] Build 24: YouTube Save for Later toolbar, playback timestamp, local library, remove/resume, bounded entries and explicit-only saving.
- [x] Build 24: optional background download with pinned yt-dlp, validated video IDs, strict output location, no browser cookies, no shell and no arbitrary URLs.
- [x] Build 24: generator for a standalone unsigned Python zipapp Linux companion installer and offline tests.
- [ ] Build 24 release gate: full regression suite, live Firefox playback/resume, native install, actual video download, packaged GUI validation and publisher signing.
- [ ] Next: cancel/progress, FFmpeg-quality options, user-friendly verified companion distribution, continued YouTube/Disney+ real testing.

- [x] Build 25: user-selectable compatible MP4, best quality with optional FFmpeg, and source audio; optional FFmpeg discovery from the DK dependency folder or system PATH.
- [x] Build 25: persistent Firefox native messaging port for bounded progress and explicit cancellation, with native process-group termination, 15-minute deadline and local-only progress state.
- [x] Build 25: added offline format, progress and cancellation regression source; no hosted Actions, and no new mandatory browser permissions.
- [ ] Build 25 acceptance: run complete local suite, test Linux Firefox native port and cancellation, verify actual yt-dlp/FFmpeg playback and data paths, and perform YouTube preroll/midroll and Disney+ browser checks.

- [x] Build 26: manual saved-video search and sorting, secure bounded backup import/export, duplicate handling, bulk clear with confirmation, offline regressions.
- [ ] Build 26 acceptance: full repository test suite and real Firefox UI/storage session test.

- [x] Build 27: native partial-file resume on explicit retry, persisted coarse per-video download status, interrupted-state recovery after Firefox restart, fixed safe processing-phase messages and offline tests.
- [ ] Build 27 acceptance: prove resume with real yt-dlp and Firefox native messaging on Linux, plus full regression suite.

- [x] Build 28: explicit, default-off automatic watch-later capture after ≥60 seconds of regular YouTube video playback, local tab/video validation, per-tab throttling, playback-ad exclusion, and privacy-first settings.
- [ ] Build 28 acceptance: live YouTube navigation, video ads, Firefox restart, stored-history privacy and full local regression suite.

- [x] Build 29: local favorites, watched/unwatched markers, private notes, collection filters and metadata retention across automatic/manual video position updates, with regression coverage.
- [ ] Build 29 acceptance: test Firefox library controls and metadata backup, full source suite and live video playback.

- [x] Build 30: explicit viewing-history erase + auto-remember off, clear last coarse download status, reject erase while active native job, serialized storage cleanup and visible privacy status.
- [ ] Build 30 acceptance: complete local suite, actual Firefox storage restoration and download-vs-erase race tests.
