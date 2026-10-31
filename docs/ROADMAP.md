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

- [x] Build 49: user-initiated cosmetic rule inspection page, bounded selector match counts, reversible visible-element outlines and explicit clear.
- [ ] Build 49 acceptance: Firefox live DOM/shadow DOM checks, no-display-mutation proof, correctness with rule updates, selector-to-source attribution, complete regression suite.

- [x] Build 50: browser-native Firefox website notification default deny via browserSettings, default-on with Settings toggle, conflict handling and extension-owned cleanup.
- [x] Build 50: synchronize older hard-coded background test script lists with language filters, context menu and notification helper.
- [ ] Build 50 acceptance: real Firefox permission disclosure, notification requests, per-site exceptions, conflicts and complete Node/Python regression suite.

- [x] Build 51: separate per-site cookie-consent-rejection and newsletter/distraction cleanup controls without disabling ad/tracker filtering, subdomain behavior, persistent exception lists, and reversible Settings management.
- [ ] Build 51 acceptance: local full Node/Python regression suite, real Firefox cookie-consent CMP tests, site-specific restore/reload behavior, cross-origin iframe checks, accessibility and saved preferences.
- [ ] Next: actual acceptance coverage for stalled video, cookie/overlay false positives, complete ABP functionality and permission compatibility; do not claim parity until tested.

- [x] Build 52: reversible per-site cosmetic hiding exceptions from the debugger, strict live-tab/selector guards, persisted rules and bounded large-DOM outline scanning.
- [ ] Build 52 acceptance: full Node/Python suite, real Firefox rule engine exception precedence, site switching, custom rule editor synchronization, DOM performance and accessibility.

- [x] Build 53: local syntax/duplicate diagnosis for custom rules using the same filter parsers; bounded, content-sanitized status and explicit Save remains separate.
- [ ] Build 53 acceptance: complete Node/Python suite, real Firefox editor and CSS filters, malformed imports, large-text performance, parser coverage compared with ABP.

- [x] Build 54: conservative cookie-consent action validation across visible, accessibility and title labels; rejects navigational/form submit/toggle controls and hidden buttons.
- [x] Build 54: preserve user-edited newsletter and survey dialog fields from automatic hiding; add explicit consent/distraction regression cases.
- [ ] Build 54 acceptance: full local Node/Python test suite, Firefox consent CMPs in multiple languages, never accept cookies inadvertently, preserve user-initiated overlays and accessibility.

- [x] Build 55: bounded open-shadow cookie consent dialog discovery, focused-dialog safety and one opt-out action per dialog, preserving existing settings and normal blocking.
- [x] Build 55: throttle DOM scans and add offline source tests without GitHub Actions or new permissions.
- [ ] Build 55 acceptance: complete Node/Python suite and real Firefox open/nested/late-created consent tests, keyboard/ARIA audit, long-page performance, no accidental acceptance or repeated action; closed-shadow/unknown platforms remain unsupported.

- [x] Build 56: bundled dynamic ad recognition improvements across bounded open Shadow DOM, mutation coalescing, focus/host safeguards, fair scans, and reversible styles.
- [x] Build 56: local visual QA fixture, real version-linked test assertions, compact product README and archived historical changelog.
- [ ] Build 56 acceptance: full local Node/Python suite and live Firefox validation including real-site regressions, YouTube/Disney+ playback, false positives and long-session CPU/memory profiling.

- [x] Build 57: exact multilingual YouTube ad-skip recognition; conflicting accessible and visible labels refuse clicks; link/form/toggle protection and SPA cooldown reset.
- [x] Build 57: expanded multilingual watcher selectors, avoid reporting ordinary video stalls during ad playback/offline/hidden documents, and require valid hostnames for streaming diagnostics/temporary manual repairs.
- [ ] Build 57 acceptance: full local Node/Python suite, real Firefox YouTube preroll/midroll (including localized labels), genuine content and controls, Disney+ authorized playback, safety and performance acceptance.

- [x] Build 57 QA: synchronize six browser-simulation fixtures with the cosmetic debug module and required YouTube watcher; add an explicit test-fixture contract check to the local regression suite.

- [x] Build 57 QA: align popup-refresh fixture distraction setting with its stated expectation and rerun simulated browser regression scenarios.

- [x] Build 58: revalidate the originating tab before destructive strict popup closure, while preserving the existing fast blank-first navigation claim.
- [x] Build 58: keep strict popup counters on same-site reloads; expire future/invalid popup history; preserve signed/authentication query strings and non-GET forms.
- [x] Build 58: bounded nested open-shadow cookie rejection buttons, with visibility checks and no accept-all fallback.
- [ ] Build 58 acceptance: full local tests plus real Firefox popup races, signed-link compatibility, nested consent interfaces, YouTube/Disney+ streaming and accessibility.

- [x] Build 59: one-click local Site Dashboard showing exact live-tab protection state, reasons, per-tab counts, blocked request domains, popup history and exception inventory.
- [x] Build 59: verified extension-only data snapshot, host-only privacy boundary, no URL paths or query tokens; inspect/revoke website exceptions and narrowly scoped allowances with confirmation.
- [x] Build 59: one-click recovery actions for global/site/tab pause, per-site cookie and distraction cleanup and links to existing detailed network tools.
- [ ] Build 59 acceptance: full local test suite and Firefox accessibility, focus, loading-state, tab-switch and layout acceptance; evaluate ABP gaps separately without claiming complete parity.

- [x] Build 60: serialize dashboard changes, reject stale tab selections and malformed URLs, and validate live site before exception or history mutations.
- [x] Build 60: extend offline audit to every packaged extension HTML page with local script, stylesheet, duplicate ID and control checks; add synthetic failure fixtures.
- [ ] Build 60 acceptance: full offline Node/Python suite, long-session Firefox stability and real-site audio/video/YouTube/Disney+ compatibility before test release.

- [x] Build 61: eliminate version-pinned assertion, prevent $removeparam from rewriting signed/SSO/CDN-token URLs, add source tests and conserve RAM with two-worker Node suite.
- [x] Build 61: maintain a self-checking complete Node/Python test inventory, require manifest/package version consistency and document first-test stop conditions.
- [x] Build 61 offline acceptance: on-device Ubuntu checkout passed all 437 JavaScript tests, Python companion suites, script inventory and packaging audit (October 30, 2026).
- [ ] Build 61 browser acceptance: temporary Firefox installation, real-site controls, YouTube/Disney+ playback and long-session stability. No test-candidate ZIP, public release or ABP parity assertion until verified.

- [x] Build 62: add a direct View blocked button alongside the tab blocked count, open same-tab history on Site Dashboard and display up to 250 bounded hostname-only records.

- [x] Build 63: one-click per-event blocked request details, observed resource type, event sequence, nonessential/essential caveats, known operator hints, privacy-preserving external research links and user-opt-in RDAP lookup.
- [ ] Build 63 acceptance: verify all link behavior, registered organization availability, no network lookups before consent, details match the selected live tab and all 91+ test files pass.

- [x] Build 63: remove recognizable website VPN nag banners, including observed Russian RUTUBE text, with reversible distraction cleanup and no changes to VPN routing or settings.
- [x] Build 63: recognize the RUTUBE paid-subscription promotional dialog without disabling checkout, login, media or security UI.
- [ ] Build 63 acceptance: on-device v0.3.33 full suite, live RUTUBE, Firefox popup icon and optional RDAP details.

- [x] Build 63 offline acceptance: Ubuntu desktop checkout at `123f8bd` passed 126/126 structural, 324/324 regression, Python companion and Firefox packaging checks; 450 JS passes, zero failures.
- [ ] Build 63 live Firefox acceptance: reload extension, confirm custom icon, inspect individually blocked events and optional RDAP, verify RUTUBE promotion and VPN nags disappear without playback damage, and run YouTube/Disney+ compatibility.

- [x] Firefox popup branding: place the bundled cyan DK emblem immediately before DK LIVE BLOCK in the popup header, preserve the existing 340px popup and Development build label. Awaiting Firefox visual confirmation.

- [x] Firefox dashboard sender fix: Firefox supplies `sender.tab` for internal extension pages opened as browser tabs; use the browser-provided own extension `sender.url` to authorize the dashboard, with website and foreign-extension test cases.
- [ ] YouTube playback investigation: live anti-adblock flash then black player. Do NOT equate CSS-hiding warning to video restored. Review ABP's anti-circumvention and vetted snippet model; ABP currently documents a temporary block-pause fallback on warning, which is NOT an acceptable silent workaround for DK's ad-free guarantee. Diagnose specific stopped resource types and player health, rather than blanket-blocking googlevideo.com.

- [x] Generate red/amber versions at runtime from the existing uploaded cyan DK PNG. Per-tab Firefox toolbar colour: cyan active; red globally disabled/allowlisted; amber tab paused. Keep the icon shape, transparency and app name unchanged; cache pixel data and do not recolor on each blocked request. No additional user artwork, assets or permissions.
- [ ] Confirm icon colours live in Firefox and rerun all offline test phases after this commit; the YouTube black-screen remains under investigation separately.

- [x] YouTube blocked-request field-test cleanup: show the actual selected site when opening the popup over DK Site Dashboard, distinguish current tab count from historical events, and expose only privacy-safe matched network rule evidence per request.
- [ ] Review any blocked first-party YouTube/Google image in live Firefox using matched pattern and network monitor, then isolate the black-screen cause. Do not assume Google or YouTube image blocks are malicious or automatically exempt all first-party services.

- [x] Popup dashboard-context routing regression: executable test resolves our selected YouTube tab and rejects foreign extension URLs, invalid selections and non-HTTP targets.

- [x] Firefox site dashboard: export all retained blocked requests or one selected request as readable TXT or structured JSON, including privacy-safe matched evidence, service-operator caveats, research links and any registration data explicitly queried in the current dashboard session; all done locally without automatic lookup or extra permission.
- [x] Known operator mapping for youtube.com and google.com, clearly distinguishing Google's service operation from MarkMonitor registrar and avoiding claims that first-party image blocks are automatically advertising.
- [ ] Live Firefox acceptance: verify text/JSON files are saved and importable/attachable; ensure accurate selected-tab snapshot and that YouTube's player still needs separate compatibility investigation.

- [x] Build 64: analyze real YouTube JSON: three DoubleClick blocks expected, first-party YouTube and Google images inconclusive, no blocked media resources recorded. Do not grant broad CDN exceptions.
- [x] Build 64: preserve explicit YouTube playback-refusal notices instead of merely hiding them; retain sanitized, bounded enforcement diagnostics in Site Dashboard and TXT/JSON exports.
- [ ] Build 64: complete offline Ubuntu suite, test real Firefox, investigate player black screen and ad-free compatibility; distinguish platform refusal from native and Ghostery image false positives.

- [x] Build 65: count completed permitted subrequests and display host/type activity for each tab; allow controlled user-selected exact hostname/type blocking even when website automatic filtering is allowlisted. Strict auth and main-frame safety. User toggles stored locally and reversible.
- [x] Fix prior Build 64 icon-state test ordering assumption after rule-evidence script was added, as surfaced by the user’s 145/146 passing test output.
- [ ] Build 65: full local Ubuntu test run and live Firefox verification of allowed counters and toggles. Do not claim YouTube playback fixed.

- [x] Build 65 verification follow-up: readable Inspect panel for allowed host/type activity; saved toggles visible without request logging; integration test for GitHub allowlisted resources, exact reversible selective blocks and privacy.

- [x] 2026-10-31 open-source blocker research: study uBlock Origin/uAssets, Ghostery, AdGuard, ABP, and Brave, with scriptlets, first-party response handling and Firefox API constraints. Details: [Engine research](ADBLOCK_ENGINE_RESEARCH_2026-10-31.md).
- [ ] Diagnose source of repeated first-party YouTube XHR blocks, then stage trusted local scriptlet support and carefully bounded first-party ad-metadata handling. No broad YouTube exceptions or silent pause.
- [ ] Review MIT commercial-use permissions against stated distribution preference and third-party GPL/MPL obligations before importing code or lists.

- [x] Comprehensive competitor-parity work breakdown in [Master parity plan](COMPETITOR_PARITY_MASTER_PLAN_2026-10-31.md): twenty-five distinct technical, security, QA, UX and licensing milestones. Planned Build 66-70 slices; no release/parity claims.

- [x] Build 66: export permitted site activity and one selected destination/type in TXT/JSON with privacy bounds; next source build is safe rule attribution.
- [ ] Build 66 Firefox acceptance: verify local downloads and exact selected-tab counts.

- [x] Build 67: native blocked rule provenance in Site Dashboard and JSON/TXT exports; no private request or user subscription URLs.
- [ ] Build 67 acceptance: local full suite plus Firefox source attribution on YouTube's blocked first-party XHR.

- [x] Build 68: conservative Ghostery stylesheet bridge on non-streaming sites; discard scriptlets and prevent unsafe CSS.
- [ ] Build 68: full local tests and Firefox visual validation on ordinary sites.

- [x] Build 69: actual Ghostery bundled CSS format and grouped selector parsing with strict safety checks and no scripts.
- [ ] Real Ghostery integration regression + Firefox visual check required before acceptance.

- [x] Build 70: opt-in current-open-tab combined privacy-bounded TXT/JSON reporting, max 25 tabs.
- [ ] Build 70 acceptance: Firefox download/consent and all tabs cross-window privacy test.

- [x] Build 71: count first-party YouTube XHR/media false-positive suspects and identify their safe rule sources in dashboard/exports.
- [ ] Build 71 Firefox triage: capture next YouTube enforcement run and inspect source-specific first-party blocking; ad-free playback remains unverified.

- [x] Build 73: first independently implemented, bounded Firefox MV2 YouTube player/get_watch JSON ad-field filtering. Only known fields on recognized playable responses, original-byte pass-through on unknown/oversized/malformed content, explicit opt-out, on-tab summary counters, no remote JS or video/DRM mutation.
- [ ] Build 73 acceptance: on-device complete tests, live YouTube normal video and ad-funded film tests with modified-vs-passed counters, enforcement checks and long-session safety. This is NOT yet validated against current YouTube and does not establish uBlock parity.

- [x] Build 74: first trusted packaged Firefox MAIN-world YouTube scriptlet. Rewrites only known advertising keys returned from eligible first-party fetch/XHR player JSON; avoids generic JS patching, media bytes, unrelated endpoints or account secrets. Runs from document_start but activates only when the isolated controller verifies active site/settings; disable restores native hooks. Requires Firefox >=128.
- [ ] Build 74 acceptance: verify no YouTube bootstrap timing races, player playback, ad-supported films, no page-context feature leak, clean disable on site pause and alternate player paths.

- [x] Build 75: reserve only direct, same-page, first-party POST YouTube player/get_watch JSON requests for response-side filtering so ordinary network rules cannot prematurely cancel them. Manual user blocks still apply, all unrelated/third-party ad requests remain filtered, site pause still applies. Harden MAIN-world wrapper teardown and add end-to-end VM request/response integration fixture.
- [ ] Build 75 acceptance: run complete local Node/Python suites and Firefox browser acceptance including strict filter versions; verify low latency and new playback without advertisements or enforcement. Never count a skipped cosmetic notice as playback success.

- [x] Build 76: local, vetted noop JavaScript and empty CSS redirect resources, trusted only by exact parser name/type/domain selectors; prevent arbitrary/remote/media redirect targets. Firefox extension-local redirect URL only, standard engine exception priority, no separate downloads.
- [ ] Build 76 acceptance: full on-device test suite and Firefox network substitute behavior, content-type and CSP checks, actual site compatibility and regression for login players. Only two static replacements, not full uBO redirect-resource coverage.

- [x] Build 77: prune existing known ad-only fields in YouTube's initial player bootstrap data property after verified activation; no global property rewrite or page hook bypass. One-click dedicated YouTube JSON/TXT compatibility export showing response-filter counts, safe blocked/allowed host/type rows, and player-refusal signals without URLs or titles.
- [ ] Build 77 acceptance: full local suite and Firefox actual delivery, initial bootstrap race/verification, free films and normal videos signed in/out, privacy inspection of exports.

- [x] Build 78: bound nested serialized YouTube player JSON ad-only field removal and synchronize MAIN-world readiness with the isolated controller to resolve startup races.
- [ ] Build 78 acceptance: Ubuntu suite, Firefox MAIN/ISOLATED event handshake and real YouTube normal/film playback tests.

- [x] Build 79: repair saved YouTube response-filter toggle propagation, preserving the opt-out and restoring native per-resource rule behavior. Integration tests assert off/on persisted values and request cancellation changes. Refresh master competitor-parity delta, explicitly distinguishing source implementations from real Firefox evidence.
- [ ] Build 79 acceptance: complete on-device suite and live Firefox toggle, playback and enforcement verification; no uBlock-equivalence claim.

- [x] Build 80: tab-scoped count of player request attempts compared with responses handled and modified; no bypass when Firefox lacks response-filter support, strict UTF-8 decoding gate, and pathological fetch clone recursion avoidance.
- [ ] Build 80 acceptance: full on-device regression suite, live YouTube playback and filtering metrics. A missing response or blocked player remains a failure.

- [x] Build 81: native `$method=POST|GET|~HEAD` rule matching with constrained method validation and exception precedence; propagate Firefox request method to native and hybrid filters and maintain rule-validator compatibility.
- [ ] Build 81 acceptance: cross-engine differential verification plus full on-device and browser regressions. Method matching is only one part of ABP/uBO parity.

- [x] Build 82: independently written, bounded ad-only entry processing for YouTube browse, search and reel_watch_sequence JSON. Only positive ad renderer and explicit Shorts isAd markers are removed; traversal gathers all changes before committing and leaves unsupported/oversized data intact.
- [ ] Build 82 acceptance: complete Ubuntu and Firefox tests including Shorts, feeds, search, ordinary videos and free movies. No ad-free claim without actual playback evidence.

- [x] Build 83: repair standalone Node/Firefox shared feed-helper resolution. Tests now load the complete MAIN-world script group in manifest order, cover YouTube initial sponsored feed data and actual Shorts response rewriting through the exported response module.
- [ ] Build 83 acceptance: full offline suite and live Firefox behavior. Do not treat manifest presence or successful module imports as proof of YouTube ad removal.

- [x] Build 84: add the six omitted YouTube/redirect test files to the local runner (110/110 listed), update background integration expectations to correctly test browse response rewriting and normal video retention, and preserve outer playback refusal status even with nested player data. Offline full-suite and Firefox acceptance remain explicitly open.
- [ ] Build 84 acceptance: full Ubuntu local Node/Python suite, real playback and ad-free verification in ordinary/Shorts/movie-with-ads modes.

- [x] Build 85: time-bound the Firefox YouTube JSON response stream at four seconds, flush original bytes and disconnect on timeout; immediately stream oversized responses through rather than waiting onstop. Expose timeout counts in the local dashboard and TXT/JSON report; add deterministic timeout/oversize regression tests.
- [ ] Build 85 acceptance: full offline suite and real Firefox playback, no stalled players or phantom success; deadline checks are not ad-free playback verification.

- [x] Build 86: unify Firefox first-party YouTube JSON request eligibility across pre-request pass-through and response interception. Require HTTPS matching origin and reject unknown/unrelated contexts; preserve default network filtering otherwise. Add source tests for unrelated pages and no originating document.
- [ ] Build 86 acceptance: full offline suite and real Firefox request/response consistency, embeds, Shorts and movie-with-ads playback checks.

- [x] Build 87: fix stale oversized-stream test to model browser forwarding after disconnect, preserve normal split-stream and missing-response checks, and correctly name YouTube API JSON request counters in dashboard/export.
- [ ] Browser-level verification of stream disconnect, complete offline suite and actual YouTube ad-free playback remains required.

- [x] Build 88: category-specific YouTube API counts for player, browse/search and reel_watch_sequence requests and modifications, retaining old totals. Reporting uses data-only snapshots, capped values and tab isolation.
- [ ] Build 88 acceptance: full Linux regression suite and real Firefox YouTube playback/ad-free test, with response-to-request ratio.

- [x] Build 89: cap concurrent YouTube response streams at 16 globally / 4 per tab to protect resource-limited systems, decrement on all filter exit paths, and surface skipped-memory-limit counts in dashboard and exports.
- [ ] Build 89 acceptance: 8 GB Ubuntu memory profiling, long-session Firefox playback and full Node/Python suite. Busy responses are intentionally not modified; no ad-free claim.

- [x] Build 90: site-scoped uBO-style literal `##:has-text` rules and exceptions; reject generic/unsafe selectors and preserve native `:has()` CSS. Include parser, engine and validator regression coverage.
- [ ] Build 90 acceptance: full local suite, Firefox DOM testing, and performance/accessibility review. Advanced uBO procedural compatibility remains incomplete.

- [x] Build 91: MAIN-world first-party YouTube API handling canonicalizes relative browse/Shorts paths through the current page origin in both fetch and XHR, preserving host and POST checks. Added relative fetch/XHR regressions so feed ad entries are not silently missed.
- [ ] Build 91 acceptance: real Firefox YouTube relative API calls, ordinary playback and free-with-ads movie tests, full local suite.

- [x] Build 92: reprocess newly replaced YouTube SPA player/feed bootstrap on explicit refresh, with idempotent hooks and disabled-state isolation.
- [ ] Build 92 acceptance: real Firefox SPA navigation/player/feed and full offline regression suite.

- [x] Build 93: cap YouTube feed parser object fields/edges and preflight all targeted arrays before changes, refusing frozen/sealed arrays without partial mutation; preserve normal items and fail-open unknown schema behavior.
- [ ] Build 93 acceptance: live Firefox read-only page data, heavy feed/Shorts and complete local regression suite.

- [x] Build 94: MAIN-world video JSON hooks fail open on frozen/nonconfigurable data and do not reject fetch/XHR responses due to page-defined object restrictions. Check all targeted fields before mutation, retaining signed video data and playback status.
- [ ] Build 94 acceptance: complete local tests and live Firefox signed playback, immutable objects and browser compatibility.

- [x] Build 95: narrowly support `$removeparam=utm_*` for common campaign tracking keys, with exact and broad exceptions and signed URL safeguards. Correct frozen-json fixture: parsed text is independent of a read-only JS result.
- [ ] Build 95 acceptance: full suite plus live Firefox signed and purchase links.

- [x] Build 96: generation-scoped YouTube response counters prevent in-flight requests from a prior tab page from rebuilding stale stats after navigation, tab removal or tab ID reuse. Slots still release and limits remain in effect.
- [ ] Build 96 acceptance: full local suite and Firefox rapid-navigation playback, tab reuse and error/deadline stress.

- [x] Build 97: correct relative YouTube page-bridge integration fixture to return unique Response objects per fetch and independently validate player/browse/Shorts responses and unknown endpoint pass-through. Prevent false regressions from reusing a decorated mock Response across unrelated routes.
- [ ] Build 97 acceptance: complete local suite and Firefox relative-API playback tests.

- [x] Build 98: reject advanced pseudo-selectors that are not supported by native CSS or the bounded DK procedural engine, instead of counting them as working filters. Retain native :has and :not.
- [ ] Build 98 acceptance: full Node/Python and Firefox selector tests.

- [x] Build 99: procedural cosmetic rules accept up to eight named sites and respect individual site exceptions; indexed by site.
- [ ] Full suite and Firefox DOM tests pending.

- [x] Build 100: safe procedural cosmetics support up to 16 explicit positive/negative site scopes. At least one positive host is required; excluded subdomains never receive an unrelated site's literal matching. No global text scans.
- [ ] Build 100 acceptance: full Node/Python regression suite and Firefox multi-site/embedded-page DOM tests.

- [x] Build 101: quoted literal cosmetic `:has-text` and `:-abp-has-text` phrases are unquoted for matching, while unsupported regex-like expressions and empty literals are rejected.
- [ ] Build 101 acceptance: Firefox DOM tests and full local suite.

- [x] Build 102: safe site-scoped literal `:contains(...)` cosmetic aliases reuse existing bounded text predicate and exceptions, refusing generic/regex forms.
- [ ] Build 102 acceptance: full regression suite and live Firefox DOM matching.

- [x] Build 103: count YouTube JSON response bodies deliberately not inspected because headers indicate non-JSON, incompatible charset or oversized payload. Expose private per-tab skipped-header counts in the dashboard and TXT/JSON report.
- [ ] Build 103 acceptance: complete local regression and live Firefox header classification against real player/Shorts feeds.

- [x] Build 104: case-insensitive matching of exact UTM query exceptions during UTM-family cleanup, leaving non-UTM query keys untouched.
- [ ] Build 104 acceptance: Firefox navigation, full regression suite and signed-link checks.

- [x] Build 105: cap literal sponsored-text scans at 32,000 characters per candidate and fail open on untrusted text getters, preventing rule-matcher work on enormous page bodies.
- [ ] Build 105 acceptance: full offline tests, Firefox DOM performance and accessibility checks.

- [x] Build 106: reject another class of nested counted regex repetitions during list ingestion to reduce browser CPU risk. Keep ordinary safe regex and hostname ad filters available.
- [ ] Build 106 acceptance: full suite and multi-list regex/performance differential profiling.

- [x] Build 107: cross-feature reliability contract covering manifest, cosmetics and YouTube response safety; complete local runner now includes 111 unique JS test files.
- [ ] Full Ubuntu/Firefox acceptance remains necessary.

- [x] Build 108: preflight *all* indices affected by a YouTube feed-array splice; reject read-only/accessor/hole/nonconfigurable entries before any mutation.
- [ ] Complete local Node/Python and Firefox acceptance still open.

- [x] Build 109: retain YouTube response generation history only for tabs with active interception. Unrelated navigation clears no longer evict live-tab generation data; completion releases generation tracking, preserving 16/4 stream limits.
- [ ] Full Node/Python suite and Firefox rapid-tab stress acceptance pending.

- [x] Build 110: explicitly cap pending YouTube feed JSON traversal work and total ad-entry edits per response; fail open on excessive ad lists rather than growing queues or mutating only some entries.
- [ ] Browser CPU/memory profiling and full local regression suite pending.

- [x] Build 111: protect token, authentication, signature, nonce and session-like keys from UTM-family query stripping while still allowing ordinary campaign tags to be removed.
- [ ] Full local suite and browser checkout/sign-in link compatibility pending.

- [x] Build 112: deduplicate shared YouTube `contents`/`entries` arrays before scheduling ad removal; aliased data is rewritten only once so ordinary adjacent video items survive.
- [ ] Full suite and Firefox shared-reference/frozen-feed acceptance pending.

- [x] Build 113: discard popup claim and one-time allowance state when Firefox removes a tab, preventing strict popup traps from leaking into reused tab IDs.
- [ ] Full Node/Python suite, legitimate tab opening and popunder Firefox browser tests pending.

- [x] Build 114: ensure popup-claim TTL cleanup handles clock rollback and invalid entries; correct closed-source mock in Firefox popup simulation.
- [ ] Full suite and real Firefox popup/legitimate-tab behavior still require acceptance.

- [x] Build 115: reject conflicting or excessively numerous YouTube response header entries before JSON interception; continue to record conservative skipped-header outcomes.
- [ ] Complete local suite and Firefox content-type/header behavior acceptance pending.

- [x] Build 116: deduplicate equivalent per-site procedural rules, preserving exception priority and bounded output before content-side DOM scanning.
- [ ] Full Node/Python run and Firefox heavy-list profile remain mandatory.

- [x] Build 117: fail-open on entire signed/download/callback query strings before applying optional tracking parameter cleanup; keeping a signature key while editing other signed fields is not safe.
- [ ] Complete local suite and Firefox signed payment/authentication/download acceptance outstanding.

- [x] Build 118: recognize trusted cross-subdomain HTTPS youtube.com first-party origins for selective response handling while rejecting lookalike, credentialed, insecure and unrelated initiators.
- [ ] Full local and Firefox subdomain/embedded-media acceptance required.

- [x] Build 119: reject unbalanced cosmetic-text quotes and regex-like patterns with flags, preserving literal labels and accurate validator coverage.
- [ ] Full offline suite and real Firefox DOM verification pending.

- [x] Build 120: recognize additional explicit sponsored renderers in YouTube search/feed JSON and rich section wrappers, without changing organic video rows or media playback data.
- [ ] Real Firefox YouTube search and feed/ad-free playback verification still required.

- [x] Build 121: include the first-party `/youtubei/v1/next` watch-next API in bounded JSON ad-only response handling, preserving ordinary recommendations, tracking and video metadata; the Firefox listener now registers that route.
- [ ] Full Ubuntu/Firefox watch-next/sidebar ad tests remain required.

- [x] Build 122: complete watch-next support by admitting the bounded `results` array family in feed ad-only traversal, preserving ordinary compact videos and private tracking data. This closes the missing traversal gap after Build 121.
- [ ] Full Firefox watch-next/sidebars and complete Ubuntu tests still pending.

- [x] Build 123: improve bundled offline YouTube ad-only cosmetic fallback and bump safe first-party YouTube pack to version 3 for desktop search and mobile ad renderers. Update rollback/version fixtures.
- [ ] Firefox YouTube visual acceptance and complete local test suite still pending.

- [x] Build 124: bound sponsor-only JSON removal in YouTube `/youtubei/v1/playlist` responses alongside browse, search, watch-next and Shorts, retaining playlist video entries and user tracking fields.
- [ ] Full Firefox playlist and standard-player playback tests still needed.

- [x] Build 125: fail open on feed/watch-next/playlist responses with explicit playability refusal or structured error, preserving original JSON and server-side enforcement evidence.
- [ ] Live Firefox refusal/playback checks and full regression suite remain outstanding.

- [x] Build 126: split privacy-limited per-tab YouTube JSON diagnostics into player, feed/search, Up Next, playlist and Shorts, including request/response/modified counts, without storing request URLs or video identifiers.
- [ ] Full suite and live Firefox diagnostic correlation/accurate ad-blocking acceptance outstanding.

- [x] Build 127: recognize dedicated AMP ad elements in bounded reversible DOM ad detection on news/mobile pages, preserving editorial AMP components and protected forms/media/player regions.
- [ ] Full offline suite and AMP-enabled Firefox site acceptance pending.

- [x] Build 128: bundle AMP ad-only CSS selectors in the offline fallback, complementing reversible DOM recognition and avoiding delayed visible AMP ads before a scan.
- [ ] Verify CSS injection and on/off restoration across Firefox AMP news pages in full browser acceptance.

- [x] Build 129: recognize exact accessible ad-slot and ad-banner test labels while rejecting lookalike editorial article names and retaining form/player safety.
- [ ] Full browser DOM acceptance and local test suite still pending.

- [x] Build 130: consolidate source-level regression checks for ad-only YouTube pack v3, first-run cosmetics, signed navigation safety, watch-next/playlist refusal handling, AMP container recognition and five private response metrics categories.
- [ ] Full 111-file test suite and real Firefox browser/performance/anti-adblock acceptance still required.

- [x] Build 131: align the separate built-in privacy tracker remover with the engine's signed-query safeguards. Preserve entire URLs containing UTM-prefixed signature/session/token/state and additional cloud signing markers, not only the signature keys themselves.
- [ ] Complete regression and browser checkout/authentication/download safety acceptance pending.

- [x] Build 132: protect fragment-based OAuth/SSO callback URLs before marketing-parameter cleanup, including hash-router code/state/token flows; retain normal article tracking cleanup.
- [ ] Full Linux suite and browser authentication callback acceptance outstanding.

- [x] Build 133: reject duplicate, contradictory or malformed Content-Type charset directives before opening a Firefox YouTube JSON filter. Safe single UTF-8 declarations remain eligible.
- [ ] Full Firefox response compatibility and local test suite still pending.

- [x] Build 134: fix possible duplicate buffered response chunks when an intercepted Firefox stream write fails after earlier chunks were accepted. Track committed flush progress; fail open and preserve normal playback where possible.
- [ ] Full local Node/Python and Firefox stream-error integration remains necessary.

- [x] Build 135: preflight outer and nested page-world player objects for read-only ad fields and stringified child writeback before any deletion, avoiding partial modifications in ordinary video responses.
- [ ] Real Firefox player-object security and full local suite still pending.

- [x] Build 136: fail-open on read-only fetch and XMLHttpRequest prototype hook assignments and restores, preserving page execution and remaining supported hook paths.
- [ ] Real Firefox immutable page API and complete suite acceptance pending.

- [x] Build 137: support safe site-scoped CSS class/ID roots in literal procedural text/descendant filters, with malformed roots rejected and scoped exceptions intact.
- [ ] Full Linux and real Firefox DOM acceptance still pending.

- [x] Build 138: procedural CSS restoration now undoes only display:none!important still owned by the extension and preserves page styles changed afterward. Restores absent original display property by removal, not an empty declaration.
- [ ] Full Firefox CSS toggle/reload and local suite acceptance remains pending.

- [x] Build 139: skip redundant procedural DOM writes for already-hidden ad elements, and remember a website's newer inline display if it changes before the next scan.
- [ ] Complete local suite and Firefox mutation/performance acceptance still pending.
