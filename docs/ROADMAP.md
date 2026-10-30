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

- [x] Build 31: bounded local streaming-page blocked-request diagnostics for YouTube/Disney+, host-only disclosure, 30-minute TTL, settings inspection/clear and toolbar navigation.
- [ ] Build 31 acceptance: full regression suite and real Firefox playback with user review of false-positive diagnostics.

- [x] Build 32: My Downloads read-only inventory, explicit permission and scan, safe filename-only metadata, symlink/partial exclusion, 150-item cap, optional companion packaging and offline test source.
- [ ] Build 32 acceptance: full repository suite and real Firefox native messaging and actual downloaded media listing.

- [x] Build 33: explicit user-approved, ten-minute per-tab per-host/type streaming diagnostic repair; source evidence required, expiration and revocation, opt-in only, safety UI and tests.
- [ ] Build 33 acceptance: live Firefox YouTube/Disney+ playback repair test, log/exception behavior, full offline suite and security acceptance.

- [x] Build 34: conservative site-scoped `:has-text`, `:-abp-has-text` and `:has` procedural aliases mapped to existing no-script predicates, with exception/malformed-payload regression tests.
- [ ] Build 34 acceptance: full local suite, real Firefox element hiding/restore tests and streaming player safeguards.

- [x] Build 35: opt-in per-tab Firefox network request capture, full per-request blocked/allowed/failed/redirected/pending state, bounded in-memory storage, filters, local CSV export, and blocked-request icon badge styling.
- [ ] Build 35 acceptance: full repository regression suite, Firefox live request capture, badge count and navigation resets, export privacy checks, and YouTube/Disney+ real playback verification.

- [x] Build 36: strict default-on Pirate Bay/1337x opener-tab and navigation-target closure, about:blank interception, duplicate-event suppression, per-source badge count, 15-second one-time new-tab permit, global opt-out and unit checks.
- [ ] Build 36 acceptance: full offline regression suite, Firefox real-world popup/popunder tests on supported domain variants, magnetic URI and Ctrl-click behavior, late opener races and window popups.

- [x] Build 37: developer Proton support address, explicit email-draft bug reporting UI, categories, bounded user-controlled report fields, optional hostname-only website context and no automatic telemetry.
- [ ] Build 37 acceptance: Firefox support page/mailto handling, test clipboard fallback and final Mozilla Add-ons support listing configuration at release.

- [x] Repository support documentation: prominent README **Bug Reporting & Support** section, root SUPPORT.md, mailto contact and reporting guidance using elderredsoftworks@proton.me.

- [x] Build 38: request-level Network Monitor controls (exact source site + destination hostname + Firefox resource type), ten-minute tab / browser-session / remembered exceptions, on-screen revocation, opt-in evidence and confirmation gates, and conservative Access Inspector with observed vs. likely classifications.
- [ ] Build 38 acceptance: full local test suite, Firefox real-site filter behavior, allowed/blocked UI lifecycle and persisted exception tests, sensitive URL and proxy compatibility review.

- [x] Build 39: bounded private popup/popunder closure history, later destination hostname enrichment, strict vs. filter reasons, two-hour expiry, local refresh and clear controls.
- [ ] Build 39 acceptance: complete offline test suite and live Firefox navigation-target/blank-first/permission tests.

- [x] Build 40: additional high-confidence DOM advertising signatures, article/player/identity ancestor safeguards, fair bounded scanning across long pages, restoration and negative-case regression checks.
- [ ] Build 40 acceptance: full offline suite and real Firefox live ad detection with manual false-positive review, especially videos and authentication.

- [x] Build 41: verified 32 focused YouTube controller/watcher/pack-validator regression cases, reject recycled unrelated ad-slot buttons, stronger CSS visibility and accessible-label detection, bounded NodeList mutation inspection.
- [ ] Build 41 acceptance: full offline Node/Python suite, real Firefox YouTube desktop/mobile SPA/preroll/midroll tests, skip-control accessibility and sign-in/playback false-positive audit.

- [x] Build 42: private YouTube player-health probe (buffering and HTML5 media errors), top-frame/host verification, local-only bounded event history, correlation labels for nearby blocked media and explicit clear/read UI with no automated allowances.
- [ ] Build 42 acceptance: full local Node/Python suite, live Firefox preroll/midroll/long-playing YouTube video tests, background/content origin guard audit, actual playback-repair effectiveness and Disney+ compatibility.

- [x] Build 43: local YouTube + Disney+ HTML5 playback diagnostics, strict live-tab and source-website evidence matching, streaming-tab-aware Settings selection, individual temporary repair revocation and cross-site spoofing tests.
- [x] Build 43: ABP Premium desktop feature checklist separated from independent functional/browser validation; no parity claims.
- [ ] Build 43 acceptance: full offline Node/Python suite, independent Firefox Disney+ logged-in playback and ad-tier test (if legitimately available), YouTube preroll/midroll, DRM compatibility observations and video-player false-positive review.
- [ ] Public release gate: close outstanding ABP free and Premium Firefox feature parity tests including cookie consent, distraction removal and automatic filtering on real websites, privacy/security review and signed Firefox AMO acceptance.

- [x] Build 44: default-on cookie, annoyance, social and tracking/ad filter lists on fresh installs; explicit opt-out preserved in stored settings; no paid or Acceptable Ads allowlist.
- [x] Build 44: enhanced conservative reject-only multilingual cookie handling (English/Turkish/Arabic/Russian/Chinese/Welsh and existing labels); ignore sensitive, invisible or disabled controls.
- [x] Build 44: bounded reversible newsletter/survey/floating corner-ad overlay cleanup, video/iframe/player and authentication/payment protection, direct setting and regression checks.
- [ ] Build 44 acceptance: end-to-end Firefox cookie choices on diverse consent-management tools, real floating-video discrimination, newsletter/survey false positives, filter-list download status and full Node/Python suite.
- [ ] Later: vetted browser-language filter subscription selection with explicit privacy/performance review; don't silently install unverified regional lists.
- [ ] Later: investigate Firefox notification-permission controls, since a content-script overlay detector cannot suppress browser-owned native permission UI.

- [x] Build 45: first Advanced parity controls: user-selectable toolbar badge, right-click visual element picker, optional developer inspection panel with local capture.
- [x] Build 45: transcribe all supplied ABP 4.49.0 General and Advanced settings into docs/ABP_FEATURE_INVENTORY.md, recording source-implemented/partial/missing/different-by-design status.
- [x] Permanent product requirement: no promotional messages, sponsor placements, Acceptable Ads program, paid whitelist or premium upgrade nags; default-on ad/tracker protection.
- [ ] Build 45 acceptance: real Firefox context menu and optional DevTools verification, permission disclosure and complete Node/Python suite.
- [ ] Next: non-destructive cosmetic hiding-debug overlay, more granular filter list management, language subscriptions and notifications permission research.

- [x] Build 46: one-click toolbar website allowlist, saved Allowed Websites Settings manager, hostname-only URL sanitization, per-site removal and same persisted list as legacy Pause on site.
- [ ] Build 46 acceptance: complete local Node/Python regression, live Firefox saved-site UI, subdomain scope, page reload, persisted migration and child-frame behavior.
- [ ] After Build 46: continue one feature at a time: (1) per-filter-list management, (2) language filters, (3) cosmetic debug inspector, (4) native notification prompt research, then remaining ABP free/Premium parity testing and streaming acceptance.

- [x] Build 47: each bundled list gets an independent enable/disable and update control; custom HTTPS lists have Refresh/Remove; last-good cache preserved after failed download.
- [ ] Build 47 acceptance: full Node/Python test suite and Firefox per-list toggles, cache/network errors, settings synchronization.

- [x] Build 48: six curated optional language filter lists; manual selection or click-to-recommend from Firefox languages; individual update/status and caching through existing subscription engine.
- [ ] Build 48 acceptance: download and verify each regional source, filter-list licenses and multi-language performance in real Firefox; no claim of full ABP language parity yet.
