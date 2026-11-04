## Build 381 candidate: two-signal YouTube strategy fallback (draft, not released)
- [x] Reuse existing, bounded adaptive YouTube strategy and old recoverRefusal rather than deleting either implementation.
- [x] Require two independent refusal events at least twenty seconds apart, both bound to the current Firefox watch tab, before changing strategy.
- [x] Keep single/transient refusals passive, veto strategy changes when ad-showing or Skip Ad evidence was observed.
- [x] Switch to temporary response/bridge observation only without changing network ad filters or reloading the tab, expire after ten minutes and guard repeats for one hour.
- [x] Add module and background integration regressions and JavaScript syntax checks.
- [ ] Run complete native tests and verify actual ordinary-video Firefox playback, with uBlock Origin disabled during the DK test, before claiming a playback fix.
- [ ] Underlying original refusal root cause still unknown: do not release this as verified adblock-bypass functionality.

## Build 380 candidate: YouTube false-positive and reload containment (draft, not released)
- [x] Remove forced browser-tab reload on detecting an enforcement warning; preserve normal network blocking and manual diagnostic modes.
- [x] Limit warning probe to visible error components, not the entire player text.
- [x] Require two stable observations at least 800 ms apart, with stale and hidden candidate handling.
- [x] Add regression coverage for transient warnings, repeats and hidden error components.
- [ ] Run full Ubuntu regression suite and real Firefox playback comparison before acceptance, merge, or version bump.
- [ ] Diagnose and fix underlying YouTube adblock refusal, which predates the forced-reload regression.

## Build 379 / v0.3.349: accessible live Facebook evidence (November 4, 2026)
- [x] Connect the existing count-only Facebook detector report to a user-initiated settings-page inspection button.
- [x] Select a verified first-party HTTPS Facebook tab, request local content runtime status and current GraphQL counters, show actionable diagnosis.
- [x] Export only aggregate diagnostic keys and the local extension version after a separate user action. No post text, URL paths, profile data, cookies, telemetry, remote fetch or storage.
- [x] Keep the new panel collapsed by default, preserving existing settings layout; include Russian control labels and regression tests.
- [ ] Obtain one report from an affected Facebook tab to distinguish unloaded, unauthorized, unanchored, and unchanged DOM filtering.
- [ ] YouTube playback refusal remains unresolved independently.

## Build 378 / v0.3.348: Facebook label recovery and runtime evidence (November 4, 2026)
- [x] Treat an explicit in-feed post landmark as authoritative when the label has shallow markup; detached labels without landmarks remain excluded.
- [x] Reuse the existing DK content controller's bounded characterData mutation sampling through the Meta adapter (the full engine previously exposed a no-op observeMutation handler); rescan only short, exact Ad/Sponsored labels in verified byline positions. No duplicate page-wide observer, network exceptions or UI geometry changes.
- [x] Expose only aggregate counts for recovered shallow labels and edited-text labels in the local Facebook diagnostic schema.
- [x] Add focused tests for shallow portals, real feed posts, text edits, non-ad text, detached labels, and existing label observation paths. Correct an old lifecycle test fixture missing DOM classList.
- [ ] Real Firefox Facebook acceptance: explicit Ad cards still need validation. YouTube playback refusal remains unresolved and unchanged by this build.

## Build 377 / v0.3.347: Facebook late accessibility labels and truthful hiding (November 4, 2026)
- [x] Detect exact late-arriving sponsored accessibility labels from attribute changes without unbounded feed scans.
- [x] Only report an anchored/hide success if the target is really hidden; rejected broad cards and user-exempt posts remain unresolved, not false positives.
- [x] Add regression tests for label exactness, refused hides, and mutation observer wiring.
- [ ] Retest Facebook with the explicit International Tiger Project `Ad` example, inspect in-page aggregate diagnostics if still visible; no blanket page hiding.
- [ ] YouTube player-refusal diagnosis remains open independently.

## Build 376 / v0.3.346: settings Back to Top control (November 4, 2026)
- [x] Floating dark/cyan return-to-top button appears only on a long settings page after scrolling.
- [x] Preserve existing settings layout and actions; keyboard focus, bilingual labels and reduced-motion scrolling.
- [x] Tests cover visibility, resizing/collapsing content, scrolling and isolation from blocking code.
- [ ] Visual Firefox acceptance after reloading local extension.

## Build 375 / v0.3.345: read-only Page Architect discovery (November 4, 2026)
- [x] Add conservative YouTube watch-page region recognition and a fail-closed preview when the existing player or masthead is missing.
- [x] Return only immutable booleans and region names; no DOM elements, video IDs, titles, or URLs leave discovery.
- [x] Add offline tests for missing regions, malformed documents, rejection of unsupported pages and no DOM mutation.
- [ ] Opt-in UI and reversible CSS remain deferred until owner approval; actual YouTube playback must still be verified.

## Build 374 / v0.3.344: DK Page Architect clean-view foundation (November 4, 2026)
- [x] Add inactive, strict YouTube watch-page clean-view planner, with selectable regions and mandatory original player.
- [x] Add contract tests for explicit opt-in, hostile URLs, invalid settings, immutable output and no DOM mutation; register in local test runner.
- [x] Document reversible CSS architecture, accessibility, restore-original controls and acceptance criteria.
- [ ] Owner approval of controls/layout and live Firefox testing required before enabling clean-view mode.
- [ ] Ordinary YouTube playback and anti-adblock detection are NOT resolved by this scaffold.

## Build 373 / v0.3.343: prevent stale YouTube SPA refusals (November 4, 2026)
- [x] Require a current-video ID match against the live Firefox tab before automatic recovery.
- [x] Reject delayed refusal signals after watch-page navigation; transient video ID is never stored or exported.
- [x] Add exact-URL, mismatch, duplicate-ID, and source-wiring regression coverage.
- [ ] Run full Ubuntu suite and confirm SPA switching in live Firefox.

## Build 372 / v0.3.342: YouTube recovery works with request history disabled (November 4, 2026)
- [x] Allow exact in-player YouTube refusal to trigger bounded recovery without private diagnostic logging.
- [x] Keep buffering, ad-state and media-error histories behind the existing logging switch; no new persistent storage, host allowances or telemetry.
- [x] Cover recovery gating and privacy semantics with source-contract tests.
- [ ] Run native Ubuntu and live Firefox checks (both logging on and off).

## Build 371 / v0.3.341: restrict recovery to verified YouTube watch pages (November 4, 2026)
- [x] Verify the live tab URL is an exact HTTPS YouTube watch-page origin with one valid video ID before automatic retry.
- [x] Exclude Shorts, search, homepage, embeds, credentialed URLs, duplicated video IDs, lookalikes, and other YouTube products.
- [x] Add URL matrix and live-tab source regression tests; retain tab-local and bounded recovery, no site-wide network-filter bypass.
- [ ] Native Ubuntu suite and live Firefox playback verification remain required.

## Build 370 / v0.3.340: YouTube recovery loop guard (November 4, 2026)
- [x] Separate ten-minute player-pass-through policy window from one-hour bounded reload guard; recurring player refusals cannot generate a new reload every ten minutes.
- [x] Keep guard tab- and host-scoped; site change or tab close clears it. No permanent bypass or media exception.
- [x] Add regression cases for expiry, no reload-loop, and tab/host lifecycle.
- [ ] Verify full Ubuntu test suite and live Firefox playback before claiming compatibility success.

## Build 369 / v0.3.339: bounded YouTube refusal recovery (November 4, 2026)
- [x] On observed regular YouTube in-player enforcement, retry once per tab with existing player-pass-through isolation for ten minutes, while network ad filtering remains enabled.
- [x] Avoid retry loops, preserve site-pause and user-selected experiment precedence; do not suppress YouTube refusal overlays.
- [x] Add regression coverage for one-shot recovery, expiry, tab/host isolation, mode policy and background retry gate.
- [ ] Native Ubuntu suite and live Firefox A/B required; retry is not a guaranteed anti-adblock workaround.

## Build 368 / v0.3.338: YouTube enforcement-aware compatibility triage (November 4, 2026)
- [x] Classify observed in-player anti-adblock refusal separately from buffering/media faults in the private local report.
- [x] Recommend the existing tab-local player-pass-through isolation test for the SAME ordinary video; preserve all network blocking and do not conceal YouTube's refusal screen.
- [x] Add regression tests for refusal priority, buffering-only classification and private/invalid inputs.
- [ ] Run native Ubuntu suite and live Firefox ordinary-video playback A/B; no claim yet that YouTube enforcement is resolved.

## Build 367 / v0.3.337: no silent partial Facebook fallback (November 4, 2026)
- [x] Eliminate old partial scanner fallback so missing full-core installation is observable, not silently disguised.
- [x] Add coreMissing diagnostic triage; five adapter regressions exercise full and missing engine cases.
- [x] Strengthen source audit to reject partial fallback reintroduction.
- [ ] Native Ubuntu and live Firefox confirmation of full-core initialization, ad latency and safe post handling.

## Build 366 / v0.3.336: full Facebook runtime integrity audit (November 4, 2026)
- [x] Audit the actual complete Facebook engine and its injected order instead of relying on old partial-scanner tests alone.
- [x] Guard every requested feature family, user controls, fail-closed pause, privacy reports and new test registration.
- [x] Register five negative mutation tests; never claim passing source audit proves live ad removal.
- [ ] Run native Ubuntu suite and owner Firefox feed, rail, Marketplace and optional-controls acceptance.

## Build 365 / v0.3.335: complete Facebook hide/restore reason counters (November 4, 2026)
- [x] Distinguish explicit Ad labels, unlabeled shape inference, manually marked advertisers and optional non-ad cleanup with success-only aggregate buckets.
- [x] Count restores separately; preserve fixed-key privacy export and user control of all ten integrated capabilities.
- [x] Five regressions registered. No browser-success claims.
- [ ] Verify counters in live Firefox while timing Facebook feed ad disappearance.

## Build 364 / v0.3.334: Facebook observer costs and unresolved label diagnostics (November 4, 2026)
- [x] Expose capped aggregate scan/observer/retry cost, inspected elements and unanchored label counts from the complete original engine.
- [x] Distinguish an authorized engine whose observer is unexpectedly inactive; strip all page identities/content.
- [x] Register five diagnostic contract tests.
- [ ] Native Ubuntu suite and owner Firefox comparison of visible ad latency versus observer cost.

## Build 363 / v0.3.333: pause-scoped complete Facebook observers (November 4, 2026)
- [x] Attach upstream document observer only when DK has enabled Facebook protection.
- [x] Disconnect full and mobile observers on pause; reattach idempotently on resume.
- [x] Register five regression cases and observerActive diagnostic.
- [ ] Native Ubuntu suite, Firefox performance and false-positive checks.

## Build 362 / v0.3.332: full Facebook engine fails closed on preference/authorization failures (November 4, 2026)
- [x] Prevent preference-storage errors from enabling unlabeled ad inference through unsafe default fallback.
- [x] Disarm on failed DK policy refresh; export fixed-key settings-ready/error counters.
- [x] Add five regressions; full upstream ten-feature engine remains active only when DK has authorized it.
- [ ] Full Ubuntu suite and live Firefox feed/Marketplace verification still required.

## Build 361 / v0.3.331: complete Facebook engine lifecycle tests and diagnostic triage (November 3, 2026)
- [x] Register full-core mocked async startup/pause/loaded settings regressions.
- [x] Triage zero readable ad labels separately from ad labels that cannot anchor to safe post boundaries.
- [ ] Verify full native Ubuntu suite, Facebook visible-ad timing, false positives and all user controls in actual Firefox.

## Build 360 / v0.3.330: complete Facebook startup and manifest safety
- [x] Hold requested activation until user-saved Facebook settings have loaded; keep DK site allowlist, pause and picker control intact.
- [x] Preserve all ten upstream features and repair manifest regression-test assumptions.
- [ ] Run native Ubuntu suite and live Facebook performance/safety acceptance.

## Build 359 / v0.3.329: all ten original Facebook blocker feature paths integrated (November 3, 2026)
- [x] Activate the full MIT engine in one Facebook-only runtime, replacing the partial DK-specific DOM scanner.
- [x] Include complete unlabeled-ad inference, 50ms bounded retry, portal reverse resolution, whole-post resolution, CSS deobfuscation and observer failure counters.
- [x] Include Page trust/ad marking, optional Suggested and Follow/Join filtering, placeholders and optional Stories/Reels/People You May Know cleanup.
- [x] Expose dedicated English/Russian settings; retain DK pause, site allowlist, picker and existing cosmetic exceptions.
- [ ] Native Ubuntu full suite and live Firefox test for ad latency, legitimate-post safety, controls, Marketplace, mobile and restoration.

## Build 358 / v0.3.328: owner-screenshot Facebook Ad-byline visible fallback (November 3, 2026)
- [x] Respond to a real Firefox screenshot of a ModRetro feed ad with a short “Ad” disclosure: visible feed posts need not have article/pagelet landmarks.
- [x] Add bounded safe-ancestor resolution and explicit evidence to the viewport priority scanner, with a shared mutation/scroll coalescing gate.
- [x] Register five targeted offline regressions; preserve organic-feed, editable, pause and Marketplace safety.
- [ ] Verify the Firefox extension was reloaded; use Meta diagnostics and timed live scrolling to establish whether ads now disappear before paint. Real-browser outcome unproven.

## Build 357 / v0.3.327: Facebook visible-feed response after delayed-hiding report (November 3, 2026)
- [x] Add a bounded on-screen article priority pass before rotating whole-page work queues, and run the same lightweight pass after scroll with a 120ms coalesced delay.
- [x] Keep existing strict ad evidence, safe card containment, user exceptions, mobile/Marketplace isolation and unchanged Firefox permissions.
- [x] Register a mock regression suite for visible sponsored vs organic posts, repeated scans and excluded contexts.
- [ ] Owner Firefox acceptance: confirm the source installation has been **reloaded**; use live diagnostic `visibleScans`/`visibleHidden` counts to determine whether visible sponsored cards are detected quickly. The thirty-second delay remains unverified here.

## Build 356 / v0.3.326: 32-build source checkpoint and bilingual pre-release handoff (November 3, 2026)
- [x] Close the thirty-two-build run (Builds 325–356) with unchanged Firefox permissions, guarded Meta/YouTube diagnostic behavior and local source-integrity audit.
- [x] Refresh English/Russian README introductions with the same approved red/neon banner and an explicit distinction between source checks and live-browser confirmation.
- [x] Register five final checkpoint regressions, including an exact 32-build test registry and explicit non-approval for release.
- [ ] Native Ubuntu full suite, Firefox regular YouTube video and Free-with-Ads comparisons, Facebook feed/rail/Marketplace checks, and Orion/mobile acceptance remain owner-dependent.

## Build 355 / v0.3.325: Facebook GraphQL diagnostic race and navigation integrity (November 3, 2026)
- [x] Guard the separate read-only GraphQL check against stale overlapping responses.
- [x] Verify the tab is a Facebook HTTPS page before reading stats and is still on that exact URL afterward. No changes to experimental GraphQL blocking or interception.
- [x] Five source regressions registered. Full native Ubuntu, owner Firefox and real GraphQL state acceptance pending.

## Build 354 / v0.3.324: stale YouTube A/B comparison status safety (November 3, 2026)
- [x] Suppress obsolete local report-file errors when a user clears or changes YouTube comparison inputs during an ongoing read.
- [x] Retain existing revision-invalidated comparisons, offline-only operation, privacy-safe reports and unchanged player/network interception.
- [x] Five regressions registered. Native Ubuntu and Firefox lab interaction tests pending.

## Build 353 / v0.3.323: source audit for Facebook tail-scan guardrails (November 3, 2026)
- [x] Extend source-only checkpoint with bounded tail-sampler, fast mutation root budget and editor/independent-post guard invariants.
- [x] Add five mutation-based negative tests to ensure unsafe future edits are caught before owner acceptance.
- [x] Preserve original Firefox permissions, all diagnostics local and explicit false flags for unverified browser/release outcomes.

## Build 352 / v0.3.322: multi-post anchor safety for oversized Facebook DOM wrappers (November 3, 2026)
- [x] Inspect first and last fifty article descendants for independent posts when the parent is not itself a designated article.
- [x] Prevent whole-wrapper hiding if independent organic posts appear after the former 100-anchor prefix; retain original 100-anchor budget and nested comment distinction.
- [x] Five negative/positive checks registered; native Ubuntu/full Firefox acceptance pending.

## Build 351 / v0.3.321: preserve independent Facebook posts in huge wrappers (November 3, 2026)
- [x] Sample first and last thirty child wrappers under the original sixty-child independent-post guard.
- [x] Refuse whole-wrapper removal if two sizable distinct article siblings appear near the end, preserving organic content.
- [x] Five source/negative tests registered; full Ubuntu and live Facebook verification pending.

## Build 350 / v0.3.320: late Facebook ad evidence in long cards (November 3, 2026)
- [x] Keep 650 early and reserve 200 final descendants within the same 850-element evidence scan when React renders unusually large cards.
- [x] Preserve exact sponsored action, author-row, card and organic evidence gates; no broad text detection.
- [x] Five regressions registered. Full Ubuntu and live Firefox confirmation still pending.

## Build 349 / v0.3.319: mobile Facebook scanning isolation (November 3, 2026)
- [x] Make the desktop Facebook insertion fast scanner decline mobile html-renderer posts, allowing only the existing mobile-specific author-row/content safety resolver to hide.
- [x] Retain full automatic mobile scanning and desktop immediate Sponsored removal; no unverified broad mobile hides.
- [x] Five focused regressions registered. Native Ubuntu, live Firefox/Orion mobile verification pending.

## Build 348 / v0.3.318: tail-aware Facebook article fast scanning (November 3, 2026)
- [x] Sample first and last nine article descendants in large inserted subtrees, retaining the existing eighteen-article work cap.
- [x] Keep original strict Sponsored evidence, 32-root budget and ordinary post protection.
- [x] Five offline regressions registered; native Ubuntu and live Facebook verification pending.

## Build 347 / v0.3.317: late Facebook ad portal ID retention (November 3, 2026)
- [x] Sample first and last thirty labelled IDs within the existing sixty-node portal cache check to keep detached Sponsored evidence near subtree ends.
- [x] Preserve exact ad-label match, bounded 200-ID cache and post reference/geometry requirements.
- [x] Five positive/negative regressions registered. Full native Ubuntu and live Firefox proof pending.

## Build 346 / v0.3.316: Facebook fallback attribution scan fairness (November 3, 2026)
- [x] Rotate capped 160-item Facebook Sponsored/explainer fallback scans instead of starving later explicit ad evidence.
- [x] Add privacy-safe numeric fallback cursor to explicit local report; all original ad and context guards remain.
- [x] Five regressions registered. Ubuntu/Firefox acceptance still pending.

## Build 345 / v0.3.315: virtualized Facebook mobile feed fairness (November 3, 2026)
- [x] Rotate existing 5,000-label bounded mobile scan across oversized virtualized feed DOMs, retaining original author-row and explicit sponsorship gates.
- [x] Expose only a bounded numeric mobile scan cursor in opt-in Facebook diagnostic export.
- [x] Five offline regression cases registered. Live mobile Firefox/Orion acceptance and full native Ubuntu suite pending.

## Build 344 / v0.3.314: right-rail interactive content preservation (November 3, 2026)
- [x] Protect active editor/input descendants in Facebook right-rail Sponsored sections and attributed-link cards.
- [x] Exclude contenteditable/textbox/searchbox ancestors before right-rail candidacy while retaining exact attribution, geometry and Contacts safeguards.
- [x] Five tests registered; native Ubuntu and live right-rail Facebook acceptance pending.

## Build 343 / v0.3.313: newest Facebook insertion priority (November 3, 2026)
- [x] Reserve eight of the same 32 fast-scan root positions for the *newest* of the last four React child insertions before ordinary earlier insertion traversal.
- [x] Keep independent exact-ad, organic and editor safeguards, as well as the original first/middle/tail sampling and bounded loop.
- [x] Five regression cases registered. Full native Ubuntu and actual Firefox acceptance pending.

## Build 342 / v0.3.312: protect mobile and Marketplace editing (November 3, 2026)
- [x] Add active editor/input descendant veto to Marketplace promoted tile and mobile virtualized post resolution, preserving previous geometry and ad-evidence checks.
- [x] Fix final detected historical SemVer assertion in Build339 and register safety tests in extended source-only audit.
- [x] Five focused tests registered. Native Ubuntu and real Firefox/mobile validation still pending.

## Build 341 / v0.3.311: expanded regression suite and checkpoint (November 3, 2026)
- [x] Finish cross-version test pin cleanup and extend the original source-integrity audit registration from Builds 325 to 341.
- [x] Add live-file and historical registration invariants without touching working YouTube, Disney+, Facebook filtering, permissions, approved UX geometry or release status.
- [x] Five integration audit tests registered. Native Ubuntu suite and actual Firefox/browser acceptance still pending.

## Build 340 / v0.3.310: first integration fixture repair (November 3, 2026)
- [x] Correct cross-build regression errors: historical version freezes, 250-post and right-rail modulo values, Russian uppercase label expectation and inaccurate !important display mocks.
- [x] Add five fixture integrity tests and preserve all original production blocking code.
- [ ] Remaining historical version freezes will be removed in next validation build; full Ubuntu/native Firefox tests remain pending.

## Build 339 / v0.3.309: late Facebook label priority under mutation storms (November 3, 2026)
- [x] Reserve half the twelve urgent fast-scan roots for tail label changes when more than twelve text/aria-label changes arrive together.
- [x] Keep original 32-root, 320-descendant and evidence/exception bounds; normal posts stay visible.
- [x] Five source and positive/negative regressions registered; full native Ubuntu and live Facebook tests outstanding.

## Build 338 / v0.3.308: long Marketplace listing coverage (November 3, 2026)
- [x] Rotate the existing 3,500-label Marketplace check across oversized search/result DOMs, retaining prior exact promoted badge and single-tile checks.
- [x] Include safe bounded numeric position in the user-requested local-only Facebook report.
- [x] Five offline regression cases registered. Full Ubuntu and live Facebook Marketplace acceptance pending.

## Build 337 / v0.3.307: long Facebook right-rail scan fairness (November 3, 2026)
- [x] Rotate bounded Sponsored headings (260), right-rail labels (5,500) and attribution links (220), preventing long-list starvation.
- [x] Include only aggregate scan cursor positions in explicit privacy-safe diagnostics. Contacts and normal-post guards unchanged.
- [x] Five regressions registered; Firefox right-rail and full Ubuntu testing still pending.

## Build 336 / v0.3.306: late fast-path Sponsored labels (November 3, 2026)
- [x] Sample first and last fifty candidate descendants within the existing 100-node-per-root fast Facebook scan instead of always the first hundred.
- [x] Keep 32-root/320-element budgets and vetted byline, rail and card evidence gates. No full-document fast pass.
- [x] Five offline regressions registered; native Ubuntu and live Facebook rapid insertion checks pending.

## Build 335 / v0.3.305: Facebook interactive editor preservation (November 3, 2026)
- [x] Forbid whole-card hiding if an otherwise sponsored-looking card contains a live textbox, searchbox, non-hidden input, textarea or contenteditable editor.
- [x] Preserve advertisement detection when no editor is present; existing popup, dialog and Facebook-only scope unchanged.
- [x] Five negative/positive regression tests registered. Native Ubuntu and live Facebook posting/comment checks pending.

## Build 334 / v0.3.304: Marketplace feed-boundary isolation (November 3, 2026)
- [x] Route Facebook Marketplace changes through its existing promoted-listing-aware regular scan instead of allowing the immediate general feed fast pass to hide a Marketplace wrapper.
- [x] Keep ordinary Facebook feed, pages and group fast-pass unchanged. No broader Marketplace blocking or unverified evidence.
- [x] Five regression checks registered; live Facebook Marketplace/Firefox and native Ubuntu suite pending.

## Build 333 / v0.3.303: Meta reviewer localized disclosure parity (November 3, 2026)
- [x] The existing read-only Meta dispatcher now recognizes exact Russian advertising disclosures alongside English in explicit aria-label review evidence.
- [x] Do not infer advertisements from Russian body words, Meta host ownership or other surfaces; the Facebook scanner alone performs approved hides.
- [x] Five local reviewer tests registered. Full Ubuntu and live Firefox/Meta acceptance pending.

## Build 332 / v0.3.302: Facebook diagnostic async request integrity (November 3, 2026)
- [x] Retire stale Facebook report reads on a newer user-requested inspection, guarding initial tab lookup, content message, GraphQL wait, final navigation check and error presentation.
- [x] Do not export or display a stale first request over a fresher diagnostic; preserve exact-tab navigation checks, privacy report schema and saved English/Russian renderer.
- [x] Five source regressions registered. Real Firefox rapid-click test and full Ubuntu suite pending.

## Build 331 / v0.3.301: Facebook scan-cursor diagnostic integration (November 3, 2026)
- [x] Carry the three bounded Facebook feed/label scan cursors into the existing explicit, privacy-scrubbed, local-only Meta diagnostics export.
- [x] Reject oversized, fractional, negative and untrusted raw data; preserve v2 report schema, unverified interpretation and exact-tab snapshot.
- [x] Five regression checks registered. Native Ubuntu suite and live Firefox long-feed acceptance pending.

## Build 330 / v0.3.300: scrambled English Facebook labels (November 3, 2026)
- [x] Nesty's eight-part segmented ad-label decoder now checks exact English Sponsored/Ad character signatures before bounded CSS ordering, in addition to the guarded Russian labels.
- [x] Avoid accepting arbitrary anagrams as ads: original author/boundary filters remain unchanged, and the final reconstructed string must be a recognized exact marker.
- [x] Five synthetic regression cases registered. Full native Ubuntu and owner Firefox tests remain outstanding.

## Build 329 / v0.3.299: expanded source-integrity checkpoint (November 3, 2026)
- [x] Extend the local read-only checkpoint to include Builds 325–329, rotating feed scan caps, Russian exact-label gates and twelve-node portal budget.
- [x] Preserve the original 16-build test contract for historical tests and add distinct post-324 registration checks.
- [x] Five negative-contract regressions registered. Full Ubuntu suite and real Firefox tests remain pending.

## Build 328 / v0.3.298: scrambled Russian Sponsored labels (November 3, 2026)
- [x] The Nesty Meta specialist now considers exact Russian ad labels when their character spans arrive in scrambled DOM order, subject to existing CSS ordering and all downstream Facebook post safety checks.
- [x] Match only the exact character multiset before invoking computed-style inspection; ordinary Cyrillic words remain untouched.
- [x] Five regression cases registered; native Ubuntu and real Russian Facebook tests pending.

## Build 327 / v0.3.297: Russian Facebook advertising disclosures (November 3, 2026)
- [x] Recognize exact Russian labels «Реклама» and «Спонсировано» alongside English Ad/Sponsored only in existing vetted Facebook ad slots and Meta's read-only specialist.
- [x] Carry the same exact-label meaning through feed, rail and Marketplace checks; do not infer ads from Russian body text or broad words.
- [x] Five negative/source checks registered. Real Russian Facebook browser observations and full Ubuntu regression remain pending.

## Build 326 / v0.3.296: late Facebook portal label caching (November 3, 2026)
- [x] Check both ends of added/removed React node lists when retaining short-lived, referenced Sponsored labels; preserve 12-node work budget.
- [x] Confirm ordinary text cannot create an ad label and a cache hit alone never deletes a post.
- [x] Five offline regression cases registered. Ubuntu/Firefox owner verification outstanding.

## Build 325 / v0.3.295: fair Facebook feed scanning (November 3, 2026)
- [x] Rotate bounded full-scan windows across feed articles (240), short Sponsored bylines (2,400), and portal/SVG references (1,200) rather than permanently rechecking only first nodes.
- [x] Retain prior ad-evidence gates, exceptions, geometry and 15-hide cap. No new privileges, telemetry or video playback changes.
- [x] Add five source/negative checks. Full native Ubuntu suite and owner Firefox long-feed verification remain pending.

## Build 324 / v0.3.294: sixteen-build checkpoint (November 3, 2026)
- [x] Source-only auditor checks 17 invariants: manifest privileges, dependency script ordering, approved popup/CSS geometry, Nesty review-only status, 16 test registrations and no network sinks in diagnostics.
- [x] Registered seven audit regression cases and npm run audit:checkpoint for later local Ubuntu execution.
- [ ] Full native Linux suite, real Facebook/YouTube streaming tests, Pornhub visual reflow and Russian Firefox acceptance remain pending. No public release.

## Build 323 / v0.3.293: Russian Facebook triage status (November 3, 2026)
- [x] Add Russian labels for all fixed Facebook diagnostic triage categories, suggested user checks and errors; rerender results after saved language changes.
- [x] Preserve unchanged underlying developer JSON and export, no changed ad filtering, permissions or UI geometry.
- [x] Five source/negative/translation checks; full native Linux and Firefox accessibility QA pending.

## Build 322 / v0.3.292: Russian dynamic YouTube lab results (November 3, 2026)
- [x] Localize composed A/B summary labels, warnings, outcome states, metric headings and local-only progress messages using the saved English/Russian preference.
- [x] Rerender user-visible strings on language switch; keep exported diagnostic schema, values and user-entered observations unchanged.
- [x] Five static/runtime privacy regressions; full Ubuntu and native Russian visual review pending.

## Build 321 / v0.3.291: protected Facebook editors and organic feed boundaries (November 3, 2026)
- [x] Exclude editable text, textbox and search-box ancestors from whole-card hiding even when an ad-like label is nearby.
- [x] Add five organic, multi-post, dialog, false-label and hostname regression checks. Keep confirmed Sponsored behavior otherwise unchanged.
- [ ] Full Ubuntu runner and real Facebook organic/sponsored co-scroll verification pending.

## Build 320 / v0.3.290: YouTube compatibility evidence correlation (November 3, 2026)
- [x] Extend existing user-initiated YouTube compatibility report with bounded cross-signal advice from in-player refusal, media errors, blocked media and first-party requests.
- [x] Explicitly refuse causal or ad-free-success assertions from counters. No new browser permissions or playback/network rule changes.
- [x] Five source/privacy/negative controls registered; full Ubuntu and Firefox comparison pending.

## Build 319 / v0.3.289: YouTube lab async selection integrity (November 3, 2026)
- [x] Invalidate pending A/B comparison if chosen local report changes or user clears results during asynchronous file reading.
- [x] Prevent exporting while comparison is in flight; no report file names, paths or raw contents stored in revision state.
- [x] Five tests. Full native Ubuntu/browser acceptance pending.

## Build 318 / v0.3.288: reject layout comparison during incomplete rollback (November 3, 2026)
- [x] Reject before/after Nesty layout comparisons with cleanupPending on either snapshot instead of treating as a measured improvement.
- [x] Enforce strict boolean cleanupPending validation; preserve legacy omitted field as false and all review-only controls.
- [x] Five targeted comparisons and negative controls; full Ubuntu and Firefox pending.

## Build 317 / v0.3.287: cleanupPending in Nesty Layout Scout (November 3, 2026)
- [x] Retain failed layout rollback as cleanupPending; refuse new styling until old rollback completes.
- [x] On-demand Nesty Layout Scout reports pending cleanup, review-only and not executable.
- [x] Five synthetic tests; native Ubuntu and live Firefox still pending.

## Build 316 / v0.3.286: layout preview route and hidden-tab integrity (November 3, 2026)
- [x] Cancel on-demand reflow previews when tab hidden/prerendered, full query/hash changes, or candidate tiles are detached from DOM.
- [x] Compare route state transiently, never export search queries. Keep existing grid CSS/rollback intact.
- [x] Add five route, hidden-tab, stable-preview and negative-control cases; native Ubuntu/Firefox tests pending.

## Build 315 / v0.3.285: durable layout rollback after page changes (November 3, 2026)
- [x] Preserve tracked CSS classes and styles when a site refuses cleanup; retry reversible rollback instead of losing references.
- [x] Make current layout status recognize connected leftover styles even without tracked grids.
- [x] Five source tests for route changes, class/style failures, retry and no new permissions.
- [ ] Live Pornhub layout acceptance and full Ubuntu suite pending; no CSS geometry alteration.

## Build 314 / v0.3.284: offline manual YouTube playback outcome classification (November 3, 2026)
- [x] Classify visible ads, refused videos, buffering and no-observed-ad playback as different unverified outcomes, with warnings for mixed ordinary versus ad-funded film cases.
- [x] Keep manually entered information enumerated, scrub arbitrary fields and include a conservative interpretation in the export.
- [x] Register five standalone checks without touching player, network, video HTML or permissions.
- [ ] Actual Firefox playback tests and full native Ubuntu suite still required.

## Build 313 / v0.3.283: YouTube A/B site-family comparability (November 3, 2026)
- [x] Project exact YouTube hostname to a fixed watch/embed/short-link site family, without retaining actual hostnames or video IDs.
- [x] Warn when compared reports come from different site families; never claim causal or ad-free success.
- [x] Five source checks for privacy and negative cases. Native Ubuntu and Firefox testing remain outstanding.

## Build 312 / v0.3.282: bounded Nesty evidence inputs (November 3, 2026)
- [x] Bound shared Nesty input signal and catalog traversal before filtering, preserve named-identifier allowlist and 40-signal output cap.
- [x] Keep review-only evidence handoff; no generated or executable rules, telemetry or browser permissions.
- [x] Register five data and privacy tests; full native Ubuntu suite and Firefox acceptance pending.

## Build 311 / v0.3.281: protect high-signal Facebook label changes (November 3, 2026)
- [x] Reserve at most 12 existing fast-scan roots for changed Facebook text and exact ad-label attributes before child insertion churn fills the 32-root cap.
- [x] Fix Build 309's malformed string acceptance in the node sampler; retain its 8-child budget and fast restore behavior.
- [x] Five new source/positive/negative regression tests; full Ubuntu and live Firefox still pending.

## Build 310 / v0.3.280: actionable, non-affirmative Facebook diagnostics (November 3, 2026)
- [x] Add fixed offline triage codes to the combined Facebook detector/GraphQL export; explain disabled recognition, no scanner evidence, observed hiding and unresolved cases.
- [x] Preserve strict redaction and refusal to equate network counters with successful ad removal.
- [x] Five source tests for positive, negative and malformed evidence; native Firefox acceptance pending.

## Build 309 / v0.3.279: Facebook child insertion tail coverage (November 3, 2026)
- [x] Preserve fast scan's eight-child insertion limit while covering the final four nodes of large React childList events.
- [x] Five offline positive/negative, bounded and restore checks registered; full Ubuntu and Firefox tests pending.

## Build 308 / v0.3.278: correct YouTube export snapshot identity (November 3, 2026)
- [x] Explicit export now fetches fresh background YouTube evidence instead of reusing a stale cached Dashboard object.
- [x] Validate selected tab and hostname on both sides of the capture, compare exact tab URL transiently to reject same-host video navigation, and serialize buttons while capturing.
- [x] Add five unit/contract regressions; do not collect or export private watch URLs, video IDs, account data, new telemetry or permissions.
- [ ] Full native Ubuntu suite and owner Firefox observation of ordinary-video in-player refusal versus separate Free with Ads movies.

## Build 307 / v0.3.277: prioritize Facebook late sponsored insertions (November 3, 2026)
- [x] Fix the second bottleneck exposed by Build 306's new integration fixture: the Facebook scanInserted 32-root budget could be exhausted by earlier irrelevant attributes before processing a late ad.
- [x] Examine added nodes and exact label/character changes before ordinary targets, within the existing 40-record, 32-root and 320-element limits.
- [x] Add fast-path positive/negative regression tests and make Build 306 late-ad fixture pass without loosening evidence safeguards.
- [ ] Full native Ubuntu suite; owner Firefox retest of late sponsored posts, organic cards, repeated scroll and diagnostic export.
- [ ] YouTube ordinary-video refusal still needs real player evidence before transport rule changes.

## Build 306 / v0.3.276: Facebook late React mutation bursts and regression maintenance (November 3, 2026)
- [x] With the same forty-record bound, inspect the start, distributed middle and end of a large Facebook MutationObserver callback; previously only the first forty changes were examined.
- [x] Preserve existing safe Facebook sponsored evidence/whole-card containment checks, immediate scan and periodic fallback. Other sites keep identical first-forty behavior; YouTube response/player code is unchanged.
- [x] Add tests for 41/80/120/2,000-record bursts, last-record sponsored insertion, ordered unique samples, malformed inputs and normal restores.
- [x] Repair six historical tests that hard-pinned a prior version, while retaining version consistency and historic behavior assertions.
- [ ] Full Ubuntu offline regression suite; live owner Firefox verification of ad flash/resurrection and ordinary organic posts.
- [ ] YouTube ordinary-video anti-blocker root cause remains unconfirmed. Do not invent a fix or change video transport without evidence.

## Build 305 / v0.3.275: complete Facebook local diagnostic export (November 3, 2026)
- [x] Join user-clicked Facebook DOM detector status with independently authorized GraphQL response-filter settings and bounded counters in the existing safe diagnostic export. No extra controls or permissions.
- [x] Whitelist every detector/GraphQL counter; reject arbitrary fields, raw URLs and invalid counts. If GraphQL status is unavailable, report unavailable, not disabled.
- [x] Reject results when the selected Facebook tab navigates during collection. Preserve actual DOM/network filtering unchanged.
- [x] Register privacy, scope, negative-control and read-only source tests; source smoke passed.
- [ ] Owner Firefox retest after updating local extension, then export combined diagnostic from Meta intelligence. One screenshot of a visible Ad plus 504 permitted requests is not evidence of the root cause.
- [ ] Full Ubuntu native suite and real Firefox GraphQL/scanner acceptance.

## Build 304 / v0.3.274: Russian dynamic status coverage and verified inventory (November 3, 2026)
- [x] Add exact Russian messages for report feedback, local video-library actions, downloads, phishing warning, network inspector and YouTube diagnostic lab.
- [x] Fix Build 302 fixture typo: DevTools panel has 12 unique text fragments, not 13. Actual coverage still asserts zero untranslated phrases.
- [x] Verify dynamic text translation/English restoration in isolated source smoke, register offline tests; do not translate hostnames, user-entered content or arbitrary diagnostic strings.
- [ ] Full Ubuntu offline run, real Firefox Russian accessibility/layout checks, Orion compatibility, user review and remaining templated statuses.

## Build 303 / v0.3.273: connect Russian utility dictionary to real renderer (November 3, 2026)
- [x] Fix Builds 300–302 integration gap: renderer checked only Settings dictionary despite successful extra dictionary lookups.
- [x] Translate recognized input placeholders, newly changed ARIA labels and titles while keeping entered values and website content untouched.
- [x] Test round-trip, modified runtime labels and source safety; register regression in Ubuntu runner.
- [ ] Full Ubuntu exact-commit run and real Firefox Russian visual and accessibility verification; Orion remains separate.

## Build 302 / v0.3.272: Russian Meta/Nesty and inspection tools (November 3, 2026)
- [x] Translate static Meta intelligence, Nesty Cookie Watch, cosmetic debugger and opt-in Firefox Developer Tools network panel.
- [x] Correct stale Meta experimental-off explanatory text to state the saved switch is authoritative; never change the actual toggle or filtering.
- [x] Keep original API, selected hostnames, records, permissions, page geometry, local privacy and offline translation; add static regression.
- [ ] Full Ubuntu test suite, real Firefox/Orion language acceptance, dynamic runtime statuses and remaining Orion popup translation.

## Build 301 / v0.3.271: Russian diagnostic network/YouTube UI (November 3, 2026)
- [x] Translate static Network Monitor inspection, future-request allowances, warning disclosures and private export labels, retaining English fallback and original values.
- [x] Translate the offline YouTube diagnostic comparison lab, especially distinct ordinary video versus Free with Ads film outcomes and observation-only caveats.
- [x] Add local translation scripts without changing network monitoring, experiment modes, playback, exports, storage or permissions; register focused coverage test.
- [ ] Full native Ubuntu suite and Firefox bilingual visual/live diagnostic checks; dynamic status strings and remaining tool screens still require coverage.

## Build 300 / v0.3.270: Russian support, library, downloads and phishing warning (November 3, 2026)
- [x] Extend locally bundled Russian UI to the video library, downloads, voluntary support report and phishing-protection warning.
- [x] Preserve exact-host security warning acknowledgment, report privacy, browser permissions and existing ad blocking; no geometry changes.
- [x] Cover all existing static interface fragments except brand/path/address names; register an offline regression.
- [ ] Full Ubuntu suite, owner Firefox visual verification, native-speaker review, and remaining extension diagnostic screens.

## Build 299 / v0.3.269: Russian extension UI coverage and warning palette (November 3, 2026)
- [x] Respond to owner's report that selecting Russian leaves most Firefox extension Settings text in English. Add explicit, local, reversible translations for static Settings, popup, and Site Dashboard text.
- [x] Load the same local interface language module in the Site Dashboard, which has no language dropdown. Use the saved Firefox-local selection and preserve the site's tab and filtering controls.
- [x] Localize option captions without translating their underlying values; preserve English fallback and no remote translation requests.
- [x] Replace the muddy brown Settings development warning with charcoal and cyan, without moving its geometry.
- [x] Add static translation-coverage regressions and register them in the Ubuntu offline test runner.
- [ ] Run the complete native Ubuntu offline suite and inspect actual Firefox display of English/Russian settings, popup, dashboard, and options.
- [ ] Review untranslated runtime-generated strings and remaining extension utility pages before claiming all UI is fully localized.
- [ ] Owner accepts the visual styling and localization in Firefox; no release yet.
- [ ] Keep Facebook missed advertising and YouTube ordinary-video playback as separate unresolved issues.

## Build 298 / v0.3.268: Facebook marked-ad miss, website charcoal theme, site Back to top (November 3, 2026)
- [x] Address owner screenshot of a clearly marked Facebook feed **Ad** surviving with Meta experimental protections on. Add bounded linked-author byline recognition for deeply nested posts lacking article landmarks, while preserving organic posts, dialogs and multi-post boundaries.
- [x] Add nine focused Facebook regressions for positive and negative cases, including immediate insertion.
- [x] Recolor previously brown Russian website panels/background to charcoal/black while preserving the approved metallic banner PNG, gold/red accents, English theme, fixed button positions and existing geometry.
- [x] Add a mobile-safe, keyboard-accessible, bilingual main-page Back to top button that appears only after scrolling; retain modal Back to top controls and reduced-motion handling.
- [x] Add eight website tests and update original pinned Russian background-color assertions.
- [ ] Run full native Ubuntu offline tests on exact GitHub commit; ensure no unrelated regression.
- [ ] Owner Firefox retest on actual ordinary Facebook feed with Meta experimental options, fast scroll, and nearby organic feed/comment/menu/Contacts. Do not mark Facebook fixed from synthetic fixtures.
- [ ] Owner visual acceptance of Russian charcoal page and site Back to top at desktop/mobile sizes.
- [ ] Resume isolated YouTube ordinary-video playback regression after collecting sanitized evidence.

## Build 297 / v0.3.267: one-tab YouTube player API diagnostic isolation (November 3, 2026)
- [x] Add explicit, confirmation-gated, temporary player API pass-through mode for exactly three first-party POST JSON endpoints while retaining general ad, media, feed, popup and tracker filtering.
- [x] Disable both player JSON modification paths and retain read-only page bridge observation in this mode; no browser extensions or new permissions.
- [x] Add nine new focused native tests and expand actual simulated background request routing coverage; preserve mode in diagnostics and A/B reports.
- [ ] Run full Ubuntu test suite on the exact commit; verify real Firefox behavior on the screenshot-confirmed regular YouTube video.
- [ ] Compare Normal, Observe only and Player API passthrough in the same browser/account/test video, recording whether playback and ads work. Determine whether first-party request cancellation is causal, not merely correlated.
- [ ] Restore known-good ordinary videos while protecting separate Free with Ads movies, Disney+ and login paths; no live fix claim without real acceptance.

## Build 296 / v0.3.266: read-only recognition of screenshot-confirmed YouTube in-player refusal (November 3, 2026)
- [x] Confirm owner screenshot shows **ordinary YouTube video** with playback blocked, not an ordinary removable popup; do not conflate this with the separately observed Free with Ads film catalog.
- [x] Add exact-site, in-player, read-only enforcement event diagnostics based on the existing text recognizer; no popup hiding, content mutation, network allowlisting or bypass of actual player refusal.
- [x] Add eight bounded privacy, visibility, negative-control, rate-limit and SPA regression tests; update the local test runner and developer triage.
- [ ] Root cause **not established**. Collect sanitized existing YouTube diagnostic report from the affected tab, inspect response/bridge/filter evidence and compare existing tab-local compatibility modes with network blocking still active.
- [ ] Verify targeted repair in real Firefox on ordinary videos and separately on Free with Ads movies; protect working streaming/login/Disney+ scenarios. No auto-success claims.
- [ ] Run exact-commit native Ubuntu full suite and record results.

## November 3, 2026: OWNER-REPORTED regression, ordinary YouTube videos only (urgent, unresolved)
- [ ] **Regression reported by owner:** ordinary YouTube video playback again triggers ad-blocker detection with DK Live Block. The owner explicitly differentiated regular videos from YouTube "Free with Ads" movies; do **not** label the movies newly broken or newly retested.
- [ ] Identify exact visible enforcement form (in-player message, dialog, or playback refusal) from a screenshot or the existing sanitized YouTube compatibility report; identify installed Firefox/DK version, extension conflicts, protection and experiment mode. No private media URLs, cookies or account details are needed.
- [ ] Check real network and page-side evidence before modifying player JSON, request allowlists or DOM behavior. The static YouTube page bridge, response filtering and anti-adblock detector were last changed on November 1 or earlier, so do not attribute this regression to the later Build 295 evidence lab without reproduction.
- [ ] Compare clean Firefox profile, signed-in/out differences and protected normal video versus explicitly separate Free with Ads movie case. Preserve the 2026-11-01 scoped owner-observed YouTube successes as historical results.
- [ ] Research current in-player anti-adblock enforcement and false positives; verify a tested, reversible fix without hiding a genuine server-side playback refusal. Do not broadly allowlist the video site, disable all filtering or change previously working streaming paths blindly.
- [ ] After a targeted fix, run local Ubuntu regression and owner Firefox acceptance with standard videos, movies, playback, login, fast navigation, media and exceptions; only mark resolved with user-observed playback.
- **Current status:** investigation, not repaired. This entry documents an actual user report, not an independently reproduced root cause. Do not copy build diary to public README.

## Build 295 / v0.3.265: offline Nesty evidence benchmarking (November 3, 2026)
- [x] Integrate 35 bounded, self-authored synthetic ad/ordinary network cases with protected player, account, editorials, navigation and checkout negative controls.
- [x] Compare existing native and embedded Ghostery hybrid engine decisions against identical expected block/allow labels and report false-positive and false-negative metrics by surface/profile.
- [x] Reject real website URLs, query strings, credentials, unknown fixture fields and unsupported provenance; never call Ghostery's raw match a production verdict.
- [x] Register local `npm run audit:evidence` command, eight Node tests and existing local release-check invocation. No runtime Nesty automation or extra permissions.
- [ ] Run the full exact-commit Ubuntu test suite and investigate any actual synthetic audit disagreements without treating the synthetic score as verified live performance.
- [ ] Obtain independently labeled, sanitized, owner-approved real evidence before any supervised model experiment, real-data schema, source compatibility claim, or automatic strategy activation.
- [ ] Continue owner Firefox acceptance of Facebook sponsored placements, Pornhub layout reflow, streaming and Orion behavior.

## Build 294 / v0.3.264: refuse same-count thumbnail swaps in temporary layout comparisons (November 3, 2026)
- [x] Compare ephemeral, local DOM node identities and direct-child ordering for the same approved Pornhub lists before, during and after the owner-triggered temporary preview.
- [x] Return `page-changed` when a virtualized feed replaces or reorders thumbnails, a listing changes, a supported in-page route changes, or fullscreen begins while comparing, even if aggregate geometry counts still match.
- [x] Keep identifiers entirely inside the synchronous preview; return only the existing coarse numerical report, never raw elements, titles, links or video data.
- [x] Add five focused source/fixture assertions and register the test suite. Preserve OFF-by-default CSS, exact hostname restrictions, owner confirmation and all established protections.
- [ ] Run full exact-commit native Ubuntu suite and verify the owner's real Firefox Pornhub page layout, scrolling, sizing, video clicks, and rollback. No visual success or universal ad-space repair is claimed.

## Build 293 / v0.3.263: layout preview rollback integrity (November 2, 2026)
- [x] Verify removal of temporary CSS grid/ad-slot classes and stylesheet before reporting a successful before/after preview.
- [x] Retain references to any page elements that prevent class removal so restoration can be retried; never falsely claim safe cleanup.
- [x] Refuse preview while fullscreen is active; preserve global/site pause, opt-in-only layout and original media protections.
- [x] Add seven registered negative-control tests and recovery guidance for incomplete restoration.
- [ ] Full Ubuntu exact-commit suite and owner Firefox Pornhub acceptance. Live DOM compatibility, responsive CSS and player click behavior remain unknown.
- [ ] Do not broaden selectors or auto-enable layout repair until actual browser evidence shows exactly what needs changing.

## Build 292 / v0.3.262: explicit temporary before/after comparison (November 2, 2026)
- [x] Add one-click, confirmation-gated preview to the existing collapsed Pornhub layout panel; OFF by default, requires active protection, never changes persistent settings.
- [x] Collect coarse before/after gaps on the **same live thumbnail list**, temporarily applying existing CSS and restoring all grid classes/styles even on errors.
- [x] Gate preview through extension-only exact-tab/top-frame background messaging and website policy checks; abort on navigation or active picker.
- [x] Nesty assesses comparable samples using fixed, non-executable outcome categories; changed row/card counts are explicitly inconclusive.
- [x] Register six focused native tests and source safety checks; preserve existing blocking and streaming behavior and approved popup geometry.
- [ ] Complete exact-commit native Ubuntu test suite, then actual owner's Firefox acceptance for video-grid behavior, warnings and layout preview.
- [ ] Refine unsupported real page markup only after observed owner browser evidence.

## Build 291 / v0.3.261: measured video-spacing gaps (November 2, 2026)
- [x] Implement bounded, on-demand, read-only horizontal measurements of **already recognized Pornhub video tiles**; never run expensive geometry checks in background/periodic scans.
- [x] Distinguish wide same-row gaps from ordinary spacing, wrapping, hidden/throwing rectangles and overlaps; return only rounded aggregate counts and approximate largest gap.
- [x] Feed validated optional geometry to Nesty Layout Scout with fixed non-executable advice for wide gaps before/after the existing opt-in CSS grid.
- [x] Update the existing collapsed Site Dashboard diagnostics text without adding UI controls or changing approved geometry.
- [x] Add eight focused regression tests to local Linux test inventory; preserve legacy count-only inputs and all user pause/restore behavior.
- [ ] Full exact-commit Ubuntu suite and actual Firefox visual test on the owner's Pornhub video-list markup and viewport sizes. **No verified gap closure claimed.**
- [ ] Use real markup/evidence, not guessed selectors, for a subsequent carefully scoped repair of any unhandled ad-space region; no automatic general-site CSS writing.

## Build 290 / v0.3.260: read-only Nesty Layout Scout integration (November 2, 2026)
- [x] Register a fourth responsibility-based specialist, Nesty Layout Scout, with no extra numbered methods or changes to the existing three specialists.
- [x] Feed only on-demand, bounded Pornhub layout diagnostic counts to a local review-only categorizer; reject malformed and impossible counts and site lookalikes.
- [x] Provide fixed manual review guidance through the existing Site Dashboard without new buttons, CSS rule generation, model downloads or network telemetry.
- [x] Track up to four repetitions of an identical numeric pattern in memory, explicitly not a claim that any advertisement or spacing change was visually confirmed.
- [x] Add native regression cases and preserve the opt-in-only reflow, site pause and video safety.
- [ ] Full exact-commit Ubuntu suite and real Firefox acceptance for Pornhub layout, current markup, page resizing, scroll/recycled thumbnails and pause/undo.
- [ ] Obtain real labeled/owner-approved evidence before training actual ML models or expanding to new sites and layouts.

## Build 289 / v0.3.259: read-only layout diagnosis and safety (November 2, 2026)
- [x] Add bounded Pornhub layout recognition counts: eligible listing groups, available videos, empty ad placeholders and rejected/oversized lists, without storing or exporting URL/content data.
- [x] Surface read-only private diagnostic in a collapsed Site Dashboard section, shown only for the selected live Pornhub website tab and guarded against content-page callers.
- [x] Tighten /video/search path matching and avoid altering placeholders with unrelated accessible labels or active controls.
- [x] Register five Node regression tests and retain existing reversible, default-OFF compact grid.
- [ ] Full native Ubuntu suite and real signed-in Firefox Pornhub layout acceptance, including resizing, infinite scrolling, saved settings and site pause; not proven by simulations.
- [ ] Use observed current markup and reports to refine which real empty spaces can safely be collapsed; later integrate Nesty observations without giving AI removal authority.

## Build 288 / v0.3.258: opt-in visual layout reflow (November 2, 2026)
- [x] Document the owner's Pornhub observation: ads suppressed yet video tiles remain far apart; request reflow rather than just cosmetic hiding.
- [x] Add lightweight local, reversible, exact-site Pornhub video-list CSS Grid repair with strict empty-placeholder and video-tile checks; default OFF.
- [x] Add a single experimental Settings checkbox, preserve approved popup geometry and all existing blockers and video players.
- [x] Register offline regression tests for safe candidate detection, non-duplication, restoration, setting/manifest wiring.
- [ ] Full Ubuntu suite and signed-in Firefox page acceptance, including current video-list selectors, two-video spacing, resizing, fast scrolling and normal click/playback. Real visual success **unverified**.
- [ ] If needed, iterate on owner-observed DOM markup only, then add per-site preview and conservative Nesty outcome metrics. See [layout repair design](LAYOUT_REFLOW.md).
- [ ] AI Evidence Lab and validated local ML work remain planned; earlier provisional Build 288 numbering is superseded by this owner-prioritized layout build.

## AI / open-source integration research queue (November 2, 2026; documentation only)
- [x] Audit actual Build 287 AI readiness: Nesty is largely review-only; two small synthetic offline classifiers are not calibrated real-world AI.
- [x] Compare Ghostery, Brave adblock-rust, uAssets, AdGuard scriptlets, Privacy Badger, DuckDuckGo metadata, ml.js, ONNX Runtime Web and Transformers.js including major license constraints; see [research audit](AI_OPEN_SOURCE_INTEGRATION_AUDIT.md).
- [ ] **Next AI evidence-lab milestone (number TBD):** deterministic real-label evidence fixtures and DK/Ghostery compatibility/false-positive benchmark, with optional comparison against Brave outside the shipping extension.
- [ ] Subsequent: validated local Nesty ML lab using real positives/negatives and offline training, opt-in review-only inference with measurable added value.
- [ ] Subsequent: in-page Nesty drift analysis and evidence-backed provider investigation, clear company/platform scope and no automatic host blocking.
- [ ] Subsequent: improve safe scriptlet, extended cosmetic, exception and redirect compatibility using our existing engine; audit all third-party license risks.
- [ ] Subsequent: separate Video/Streaming responsibilities and browser-specific Orion/iOS and Chromium/Yandex capability experiments with real-device verification.
- [ ] Keep release gate honest: current Build 287 full Ubuntu suite not run; missing genuine npm lockfile blocks prior release audit; live Firefox acceptance still required.

## Build 287 / v0.3.257: local Facebook-to-Nesty integration (November 2, 2026)
- [x] Connect successful Facebook feed, menu, right-rail and Marketplace DOM hides to Nesty's real local evidence intake; existing scanner owns all decisions.
- [x] Expose bounded, fixed-category local counts and inert strategy ownership through Facebook diagnostics, without raw content or extra telemetry.
- [x] Keep existing DOM and GraphQL safeguards, experiment controls and approved UI geometry unchanged.
- [x] Register two integration tests and record owner-confirmed Pornhub working observation, carefully scoped.
- [ ] Exact-commit full Ubuntu suite, owner Firefox Facebook fast-scroll, Marketplace, login, false positives, GraphQL rollback and video playback testing.
- [ ] Independent Instagram/Threads/WhatsApp, Orion and Yandex validation. Adaptive autonomous blocking and uBlock parity not yet established.

## Build 286 / v0.3.256: Facebook GraphQL experiment, organized Settings and Patreon (November 2, 2026)
- [x] Enable bounded first-party Facebook GraphQL response filtering for fresh installs, with Agent Nesty Meta 05 ownership. Preserve existing saved OFF user preferences.
- [x] Fix inert GraphQL checkbox Settings-save path and add an instantly saved, reversible toolbar Experimental switch; reloading Facebook reverses earlier edited responses.
- [x] Group all 25 Settings sections into eight collapsed black/cyan/white accordion sections; preserve controls and deep links.
- [x] Simplify popup and Settings interface-language selector to English and Russian without planned-language or translation warnings.
- [x] Replace Patreon footer action with compact white symbol + "Patreon", burgundy #7f2940, same position/creator URL/click-only behavior.
- [x] Precommit JavaScript syntax and source checks with adjusted registered regression tests.
- [ ] Full exact-commit Ubuntu test suite and signed-in Firefox Facebook visual, feed, login, errors, rollback and performance verification pending. No ad-flash success claim without observed evidence.

## Build 285 / v0.3.255: Nesty evidence-to-strategy coordination (November 2, 2026)
- [x] Bind verified-vocabulary Nesty evidence to deterministic **review-only** named strategy proposals for Facebook post cards, Facebook rail, experimental GraphQL ad records, YouTube ad-break evidence, and unwanted navigation.
- [x] Keep strategies explicitly inert: `enabled:false`, `executable:false`; no automatic subscriptions, rule installation, content hiding, video response mutation, or tab closure from strategy advice.
- [x] Restrict Facebook strategy proposals to Facebook, not sibling Meta apps; protected contexts and unrecognized/private tokens produce no proposed strategy.
- [x] Expose honest coordination readiness in private Nesty intelligence snapshots: no self-learning, no automatic rules, actual browser acceptance required.
- [x] Add four integration regression tests in the existing registered Nesty test file and syntax-check staged code.
- [ ] Run full exact-commit Ubuntu regression; real Firefox Facebook fast-scroll/rail, login, YouTube/Disney+, popup, and Orion checks remain necessary.
- [ ] Establish actual browser evidence and measured false-positive rates before any strategy can be considered for owner-approved activation.
- [ ] Finish real event-to-evidence intake, profile-owned observations, meaningful hypothesis evaluation, and independent Instagram/Threads/WhatsApp adapters. This is **not** a finished autonomous AI integration.

## Build 284 / v0.3.254: Russian user and distribution legal review (November 2, 2026)
- [x] Set Company Bible rule requiring Russian legal due diligence before targeted distribution and truthful claims.
- [x] Document Russia-facing legal review while expressly preserving free access for Russian users and family. OFAC GL 25G / FAQ 1040 protect certain internet communication; assess specific restricted transactions rather than inventing nationwide bans.
- [x] Publish Russian user-facing privacy/proxy explanation and link it from Russian product README.
- [x] Replace proxy bypass/Tor-promotional wording with neutral network settings text; preserve optional/off-by-default behavior.
- [x] Add regression source assertion for default-off proxy, disclosure and Russian link.
- [ ] Obtain Russian legal advice for any Russia-targeted marketing or compliance claim; assess U.S. restrictions only if a specific export, payment, counterparty or service makes them relevant. Do not impose blanket Russian geo-blocking or a legal review as a condition of ordinary free public access.
- [ ] Human Russian proofread/review of all user-facing legal/consumer copy; complete untranslated extension controls.
- [ ] Recheck applicable laws and actual Russian-language Firefox UI and network behavior before owner release approval.
- [ ] Native full-suite run on Build 284, then actual Firefox/Orion acceptance when relevant; no automatic CI for text-only changes.

**Build 283 post-fix verification:** [Ubuntu run 41539831637](https://github.com/dereksparks1982/dkliveblock/actions/runs/41539831637) recorded **1,235 Node tests passed, 0 failed**, six Python scripts passed; **release audit remained blocked by missing genuine `package-lock.json`**. This is a native code test result, not Firefox or Russian compliance acceptance.

## Build 283 / v0.3.253: First full native Ubuntu verification (November 2, 2026)
- [x] Run complete seven-phase offline suite once in a restricted, read-only Linux workflow; observe 1,214/1,232 passing Node cases and record all 18 failures.
- [x] Address stale version/policy/fixture assertions without weakening live protections.
- [x] Fix Nesty confirmed-video child tab transition and preserve protection of source tab.
- [x] Harden resource allowance UI, YouTube filter-source diagnostics and synthetic audit origin validation.
- [x] Re-run the full Linux suite after corrections: 1,235/1,235 Node tests and 6/6 companion checks passed; release audit blocked by missing genuine npm lockfile.
- [ ] Provide a genuine npm package lock for independently reproducible AMO review; do not claim Mozilla readiness.
- [ ] Owner Firefox YouTube, Disney+, Facebook fast scroll/rail and Nesty popup acceptance; no browser PASS inferred from CI.
- [ ] Experimental Orion actual device review and Chromium/Yandex MV3 port remain unimplemented/unverified.

## Build 282: integration hardening and acceptance gates (November 2, 2026)
- [x] Restrict Nesty evidence to vetted catalog signal vocabulary; reject arbitrary text-shaped tokens.
- [x] Suppress all review candidates for explicitly protected contexts.
- [x] Cache dispatcher registrations and accepted signal vocabulary per coordinator.
- [x] Add eight focused regression tests and run 19 isolated integration tests together.
- [x] Preserve Firefox blocking engines, site exclusions, current branch and approved UI.
- [ ] Run full native Node/Linux test suite and actual Firefox regression/false-positive acceptance.
- [ ] Verify Orion on iOS/macOS; implement and test Yandex MV3 adapter before claiming support.
- [ ] Complete evidence-to-safe-response workflow only after browser verification, never autonomous blocking based on model score.

## Continuation priority: Agent Nesty / company profiles / verified-site ledger (November 2, 2026)
- [x] Preserve exact three named specialists and eleven legacy technique IDs in [team roster](AGENT_NESTY_TEAM.md).
- [x] Record owner strategy, separated company/platform/provider profiles, countermeasure hypotheses, safety limits and local AI integration sequence in [Nesty company playbook](NESTY_COMPANY_PLAYBOOK.md).
- [x] Start a distinct, scoped [verified-sites ledger](VERIFIED_SITES.md) with browser-observed successes, partial Facebook results, and unverified platforms. No company-wide defeat claims.
- [x] Keep public English/Russian READMEs strictly about product use, privacy, support, licensing and attribution; no engineering diary.
- [x] Wire read-only runtime coordination among Nesty profiles, provider observations, Meta delivery evidence and dispatcher (Build 281); focused source checks done.
- [ ] Run full local integration/regression tests and Firefox owner acceptance before declaring integration complete; production self-learning, live predictive rule updates and cross-browser network parity remain unimplemented.
- [ ] Retest Facebook rapid-scroll feed/rail flash and clickability against Build 280 with organic feed and Contacts preserved before any Facebook verified promotion.
- [ ] Investigate Meta's own advertising systems and third-party advertisers, trackers, attribution and analytics *separately*, using independently verified ownership and no speculative host-only blacklisting.
- [ ] Expand platform-specific modules (Instagram, Threads, WhatsApp) with observations first, then validated, reversible strategies and browser checks.
- [ ] Train/evaluate any future local AI against representative labeled evidence and negatives; maintain strict no-automatic-rule-generation safeguards.
- [ ] Continue working through remaining websites and promote only each independently tested site/surface to the verification ledger.

## Build 279 / v0.3.249: Live Russian banner URL recovery
- [x] Investigate report that newly approved Russian banner appears in README but not on GitHub Pages (broken image/alt-text shown).
- [x] Switch Russian banner source to an immutable raw GitHub URL, with local Pages fallback and a single-attempt error handler.
- [x] Preserve approved banner bytes, English styling, language toggle, cards and download buttons.
- [ ] Confirm actual GitHub Pages render in Firefox after publication (not verified by repository-only checks).

## Build 278 / v0.3.248: Approved simple Russian banner replacement
- [x] Verify the owner-uploaded `Metallic Cyrillic Emblem and Gold Live Block Title.png` matches the accepted image byte-for-byte (Git blob SHA `1ee6d3265a5f29c5d9656f74a0b427120887ffd3`).
- [x] Point Russian website banner selection and `README.ru.md` at the new approved red/gold/black asset.
- [x] Preserve the English neon banner, original ДК standalone icon, translations, page layout, buttons, and site controls.
- [x] Add regression coverage for existence and exact artwork bytes; remove obsolete Russian banner references from active sources and mark historic documentation superseded.
- [ ] Owner's actual GitHub Pages browser refresh and visual approval are pending.

## Build 277 / v0.3.247: Natural Russian website introduction and exact company spelling
- [x] Update only the Russian-facing introduction between the banner and download buttons with natural wording.
- [x] Preserve the company name as the exact Latin brand `Elderred Softworks` instead of phonetic Cyrillic transliterations in Russian-facing website text and the Russian README.
- [x] Align Russian meta description with standard terminology for online tracking.
- [x] Protect the correct translation and reverse switch in a focused regression test.
- [ ] Real GitHub Pages visual check remains pending. This update does not touch approved artwork, site geometry, or network-blocking behavior.

## Build 276 / v0.3.246: Bilingual website and extension controls
- [x] Website language selector in top-right outside the banner.
- [x] Local browser-language default (Russian when requested), saved explicit override, instant reversible switch.
- [x] Approved Russian ДК banner in repository, language-scoped red/gold/steel theme, unchanged English layout and four buttons.
- [x] Translate all existing static website copy including dialog lessons and info guides, without a remote translation API.
- [x] Fix frozen localization API write that blocked all card click listeners; add dark resting cards and distinct hover state.
- [x] Correct four Russian hero button colors in black/gold/white/red order with safe text wrapping.
- [x] Create a separate Russian README, clean the English README to features and usage only.
- [x] Remove obsolete `docs/index.html` copy and mirrored Pages icon/manifest, retaining `index.html` as the only maintained website source. Confirm actual Pages settings in GitHub before any further host change.
- [ ] Real GitHub Pages manual acceptance and Russian proofreading.

## Build 275 / v0.3.245: Named Agent Nesty specialists
- [x] Adopt user-approved role names: Nesty Cookie Watch, Nesty Popup Guard and Nesty Meta Ad Scout.
- [x] Make a single immutable catalog with canonical names/IDs and backward-compatible numeric aliases for all eleven legacy detector IDs.
- [x] Consolidate both known-destination and confirmed-video original-tab takeover checks behind one Popup Guard verdict, leaving their existing predicates intact.
- [x] Update live popup block labels and Cookie Watch's status interface to readable job names without changing layout.
- [x] Record team naming and ownership in Company Bible, README and the new team catalog.
- [x] Add compatibility and cross-module regression tests to the offline runner.
- [ ] Full Ubuntu seven-phase runner and real-browser XNXX, Facebook and Orion checks remain pending; do not claim full coverage.

## Build 274 / v0.3.244: Agent Nesty 5 original-tab takeover
- [x] Detect XNXX-linked confirmed video child and within 4.5 seconds a foreign original-tab navigation, independent of advertiser names.
- [x] Ignore unconfirmed/blank child, site links, foreign origins, POST and unrelated tabs.
- [x] Recover Agent Nesty 4 opener when cached source hostname arrives late, validate live opener before closing.
- [x] Add regression coverage without changing YouTube, Disney+ or approved UI geometry.
- [ ] Run complete Ubuntu suite and actual Firefox XNXX tests. No guaranteed all-popup claim.

## Build 273 / v0.3.243: Agent Nesty 4, XNXX popup redirection
- [x] Next globally numbered agent after Agent Nesty 1–3 cookie observers.
- [x] Detect XNXX source-linked new tabs and foreign navigation across creation, navigation-target, late tab updates and main-frame requests.
- [x] Block early foreign request and close confirmed popup child tabs, without ad-domain lists.
- [x] Keep same-site video tabs, authentication windows, explicit per-tab exceptions and user-disabled protection.
- [x] Add bounded attribution, source revalidation and regression fixtures.
- [ ] Full local seven-phase Ubuntu tests and live XNXX Firefox checks remain outstanding.
- [ ] Expand evidence-driven popup guards to other sources; do not claim all openerless tab mechanisms can be reliably attributed.

## Build 272 / v0.3.242: Orion storage and page-cache reliability; Agent Nesty Meta 06
- [x] Make Orion exact-site pause fail conservatively on corrupt, oversized or cleared saved host data, including storage-change events.
- [x] Prevent late initial storage reads from overriding newer decisions, and stop failed save operations leaving an actionable stale popup.
- [x] Keep Orion page-cache suspension authoritative until pageshow, even if asynchronous pause state arrives later.
- [x] Add Agent Nesty Meta 06 for exact short ad-label attribute changes on referenced ID-bearing span/SVG nodes.
- [x] Register automated focused regression fixtures in the existing offline Linux Node runner.
- [ ] Run the full seven-phase Ubuntu suite; real Firefox signed-in Facebook and Orion iPhone/Mac acceptance is pending.
- [ ] Improve cross-tab storage concurrency in the experimental candidate and validate actual Orion extension APIs.
- [ ] Leave experimental GraphQL filtering OFF and preserve streaming and approved UI geometry.

## Build 271 / v0.3.241: Nested Meta transport schema guard
- [x] Reject malformed explicitly named nested RequireJS / __bbox / result fields before any response edits, including late siblings and multi-line JSONL records.
- [x] Keep unknown ordinary user data untouched and Facebook GraphQL rewriting OFF by default.
- [x] Add seven new targeted regression cases to the existing registered Meta test file.
- [ ] Run Node tests and full seven-phase Ubuntu suite, then signed-in Firefox/Orion acceptance. No live success claimed.

## Build 270 / v0.3.240: Meta GraphQL nested response safety
- [x] Agent Nesty Meta 05 prevents partial GraphQL/JSONL mutations if any *recognized RequireJS / __bbox / result* envelope reports an error.
- [x] Abort if the bounded traversal exceeds 1000 nodes, 20 layers or 100 items in a transport collection; fail open to original response.
- [x] Preserve ordinary messages and reactions; only the existing explicit ad-bearing feed paths remain eligible for rewriting.
- [x] Register 15 adversarial transport and false-positive tests; run them in isolated V8 simulation.
- [ ] Full Ubuntu seven-phase suite and live signed-in Facebook GraphQL/Orion checks remain outstanding. Do NOT enable the GraphQL filter by default.
- [ ] Continue to build platform-aware packaging and counters without misrepresenting unverified support.

## Build 269 / v0.3.239: stale Sponsored ID defense and Orion navigation safety
- [x] Add Agent Nesty Meta 04: time-limited (15 seconds) removed ad-label evidence, bounded cache expiry, and live-target precedence for reused Facebook element IDs.
- [x] Harden Orion popup requests with exact active tab hostname matching, so a navigated tab cannot inherit a previous site's pause command.
- [x] On malformed saved pause settings, refuse to silently resume Orion cleanup; keep site paused and tell the user local persistence is unavailable.
- [x] Add 13 named regression cases for cache expiry, ID recycling, malformed state and cross-site messages; register test in Linux runner.
- [ ] Run full local Linux suite and actual signed-in Firefox Facebook testing, including feed, rail, Marketplace and ordinary post recovery.
- [ ] Test Orion iOS popup navigation, storage and device APIs before calling extension supported.
- [ ] Continue Agent Nesty simulations of first-party ad delivery, but do not default-enable Meta GraphQL response rewriting before acceptance.

## Build 268 / v0.3.238: Orion exact-site pause (experimental)
- [x] Implement active website pause/resume in a dedicated Orion-only popup, using extension messaging.
- [x] Persist at most 100 exact hostnames via local storage where supported. Session-only if storage unavailable; an unreadable saved preference pauses conservatively.
- [x] Pause calls the existing Orion scanner's DOM restore; no Firefox source changes beyond matching version number.
- [x] Add tabs/storage permissions only to Orion candidate, no DNR or unsupported network feature claims.
- [x] Add six regression source checks to the offline runner; source syntax validated. Full suite not run.
- [ ] Validate installation, message/API compatibility, cross-tab state, real Facebook ads/organic posts and performance on Orion iPhone and Mac.
- [ ] Continue Agent Nesty evasions and full Firefox Linux suite. GraphQL remains OFF until live verification.

## Build 267 / v0.3.237: Facebook feed bursts and Orion lifecycle
- [x] Remove Meta mutation-batch premature return from experimental Orion candidate; process all 40 bounded records for disappearing/portal Sponsored evidence.
- [x] Remove premature desktop Firefox observer break; no extra continuous polls or new permissions.
- [x] Add Orion iPhone foreground/page-cache generation guard and visibility rescan; stop old pending callbacks.
- [x] Add 11 focused VM lifecycle/Meta event tests; register in Linux suite.
- [ ] Run exact-source seven-phase Ubuntu test suite and actual Firefox/Orion Facebook A/B checks. Core live Facebook protection remains unverified.
- [ ] Investigate further Agent Nesty changes with a real missed ad fixture before enabling default GraphQL responses.
- [ ] Test orion-ios packaging file installation and browser API support with owner.

## Build 266 / v0.3.236: proactive Agent Nesty Meta slices
- [x] Integrate Meta-01/02/03 into current Facebook scanner and experimental Orion DOM adapter without adding a second competing engine.
- [x] Simulate fragmented/ordered Sponsored labels, menu wording changes, CSS-hidden decoys, benign captions/menus and style mutations; 11/11 focused cases passed.
- [x] Repair previously missing 29 Node test registrations; 169 listed after the new case.
- [ ] Execute all seven phases of `scripts/test-local.sh` on exact GitHub HEAD and investigate failures instead of assuming inventory repair equals PASS.
- [ ] Test real Firefox Facebook feed/rail/Marketplace and Orion mobile. No success assertion or GraphQL default-on until actual verification.
- [ ] Build next Agent Nesty family on evidence-driven GraphQL schema and React feed-card lifecycle changes, one testable family at a time.

## Post-Build 265: Orion iPhone + Mac compatibility foundation (2026-11-02)
- [x] Research Orion's official iOS/iPadOS, macOS, Linux beta status and GitHub code availability.
- [x] Add a separately packaged, DOM-only experimental Orion adapter reusing **original DK Facebook and generic ad recognizers**.
- [x] Keep native Firefox's complete manifest, permissions, runtime and version unchanged; Orion experiment has no unsupported background/response/network claims.
- [x] Add separate device-specific experimental target manifest, explicit-only packaging script, clear limitations popup, and code-based regression fixtures.
- [ ] Run actual iPhone Orion file install and real ad/organic-content tests; current source-only work is not verification.
- [ ] Measure Orion extension APIs and then implement network adapter where supported; no false parity or release.
- [ ] Review remaining independent security-contract test failures and run full Ubuntu suite before a public package.

## Next Facebook + Agent Nesty simulation slices
- [ ] Model adversarial variants: CSS order and text-split Sponsored, accessibility reference changes, altered GraphQL paths/JSONL envelope, React recycled feed cards, and Marketplace/rail rearrangement.
- [ ] Make each Meta specialist independent, local and fail-safe, with explicit evidence, event-only activation and safe undo.
- [ ] Compare to marked benign posts, Messenger, Contacts, replies, videos and shop listings; false positive means no activation.
- [ ] Keep existing GraphQL response filter OFF until live Firefox schema and performance acceptance, and collect only consented coarse diagnostics.

## Build 265 / v0.3.235: Facebook GraphQL streaming safety and right-rail coverage
- [x] Treat multi-record GraphQL JSONL edits as one transaction. If any line is malformed, unknown transport text, or contains a GraphQL error, preserve the entire original response.
- [x] Prevent outer error-bearing `require` / `__bbox` envelopes from rewriting nested records.
- [x] Renew the four-second idle timeout when GraphQL data arrives, with a separate 20-second absolute limit.
- [x] Bound GraphQL response buffering to 2,048 chunks as well as the existing 1.5 MB byte cap; on exceed, forward the original chunks and disconnect cleanly.
- [x] Match explicitly Sponsored aria-label controls in the Facebook right rail without matching ordinary left-side controls, Contacts, or feed content.
- [x] Add Build 265 atomic JSONL and Firefox filter-stream regression cases plus right-rail accessible-control fixtures.
- [x] Run the combined 34 targeted GraphQL / Facebook-rail synthetic tests: all passed.
- [ ] Full `scripts/test-local.sh` and live Firefox tests not yet run; investigate independent-audit security-contract failures before acceptance.
- [ ] Verify current Facebook feed/Marketplace and GraphQL schema with user-authorized browser testing. `metaGraphqlFilter` remains **false** by default.
- [ ] Confirm no breakage in Messenger, Contacts, ordinary posts, reactions, shopping listings or YouTube playback before widening the scope.

## Build 264 / v0.3.234: Facebook GraphQL and Sponsored right-rail integration
- [x] Recognize ad markers at explicitly named Facebook news-feed, Marketplace feed and search-result edge paths, including nested `node.story.sponsored_data.ad_id`.
- [x] Traverse bounded first-party `require` / `__bbox.result` JSONL envelopes, without inspecting arbitrary user records or blocking whole GraphQL requests.
- [x] Tighten sidebar `sponsored_data` evidence and preserve unrelated sidebar units even when an ad-only sibling is removed.
- [x] Enforce a maximum output UTF-8 byte size after rewriting, including JSONL batches, with original-byte fallback.
- [x] Fix Facebook sidebar scanner prefilter rejecting decoy-character Sponsored labels before decoding them.
- [x] Test Marketplace organic listings, Messenger, reactions, false positives and Contacts sidebar protection in bounded JS simulations (20/20 focused tests across Builds 263 and 264).
- [x] Preserve opt-in/off-by-default GraphQL flag, site exceptions, streaming safeguards, and approved UI geometry.
- [ ] Entire `scripts/test-local.sh` suite remains outstanding; investigate the independent audit's security-contract findings.
- [ ] Firefox verification with actual Facebook feed/right-rail/Marketplace reactions and current GraphQL response schema before calling Facebook PASS or enabling response modification by default.
- [ ] YouTube known-good A/B against Build 203 before accepted public release.

## Website polish / asset credit and session handoff (extension version remains 0.3.233)
- [x] Confirm the owner's DRAGON-STUDIO Pixabay MP3 is present under `assets/sound/` in the live repo.
- [x] Play the local sound on user-activated website cards and buttons; never autoplay, call Pixabay on click or block navigation when audio fails.
- [x] Replace all twelve wordy dialog Close buttons with accessible, cyan × controls and 44px touch targets for mobile.
- [x] Preserve conditional Back to top behavior so short dialogs show only the top Close ×.
- [x] Record source and Pixabay Content License in `docs/ATTRIBUTIONS.md`; link from README and on-site licensing panel.
- [x] Add website regression checks for audio, attribution link, and controls; keep both Pages entrypoints identical.
- [ ] Verify live audio on Firefox desktop/mobile, including user gesture, volume, mute, keyboard navigation and GitHub Pages asset delivery.
- [ ] Full offline Linux extension suite and live Facebook GraphQL response acceptance remain pending; do not declare blocker parity.
- [x] Add `docs/CONTINUATION_HANDOFF.md` for any thread rollover.

## Website educational hub update (post-Build 263, extension stays v0.3.233)
- [x] Make the entire six feature-card surfaces clickable, each opening a detailed ad-literacy lesson.
- [x] Add six more full-card, clickable information boxes for development status, installation, downloads, free-use/license, support and the three other project websites.
- [x] Move existing long-form sections into accessible, independently scrollable native dialogs; preserve their instructions, disclaimers and external links.
- [x] Preserve the original hero download buttons and footer. Do not reintroduce Nougat Media Plus.
- [x] Verify both GitHub Pages HTML entrypoints are identical and all 12 cards point to unique, matching dialogs.
- [x] Add `tests/website-education-hub.test.js` and `docs/WEBSITE_EDUCATION_HUB.md`.
- [ ] Perform real browser keyboard, Escape, mouse, mobile width and screen-reader checks after Pages publishes the updated files.
- [ ] Review future site copy against newly verified Facebook GraphQL capabilities; don't describe experimental blocking as proven.

## Build 263 / v0.3.233: first-party Facebook GraphQL ad-record filter and website buttons
- [x] Add separate Firefox response-body filter for schema-confirmed Sponsored Facebook GraphQL/JSONL records; preserve ordinary feed data and unknown shapes.
- [x] Restrict to protected first-party Facebook GraphQL POST XHR responses, known MIME, bounded size/time/concurrency and fail-open stream handling.
- [x] Add a separate `metaGraphqlFilter` Settings switch, default **OFF** until live Firefox verification; retain all existing ad recognition and site exceptions.
- [x] Add read-only, tab-scoped GraphQL response filter counters to Meta Intelligence.
- [x] Add three matching, bottom-aligned website buttons for Hanafi Learning Deck, Folkhold and Capital & Consequence in both Pages files, with no Nougat card.
- [x] Correct historical redirect-resource test expectation for distinct `blocked.html` phishing warning page, without widening redirect asset permissions.
- [x] Synchronize manifest and package versions at 0.3.233; create GraphQL and link regression fixtures, execute eight isolated response-filter checks.
- [ ] Reproduce all 13 independent-audit test failures on a complete Ubuntu checkout; verify security contracts rather than assuming fixed.
- [ ] Full `scripts/test-local.sh`, actual Facebook GraphQL schema/Firefox acceptance, and known-good YouTube A/B before enabling GraphQL by default.
- [ ] Recheck main-frame `$document` / `$all` blocking, performance and optional proxy/dns permission scope after test baseline is green.

## Build 262 / v0.3.232: stronger MIT Facebook label decoding and safe DOM recycling
- [x] Decode bounded nested, CSS-ordered, character-split Sponsored labels, rejecting malformed wrappers and decoys.
- [x] Protect two distinct sibling posts even when their wrapper has an article landmark.
- [x] Re-evaluate changed hidden ads after a grace period and restore React-recycled ordinary posts only after two corroborated checks.
- [x] Keep the original DK Meta module and all site-exception/restore controls; no extra extension engine activated.
- [x] Align package/manifest versions at 0.3.232 and remove hard-coded historical versions from eight feature regression tests.
- [x] Execute 13 isolated JavaScript regression scenarios from Builds 261 and 262: all passed.
- [ ] Full Linux Node `scripts/test-local.sh` suite and actual Firefox acceptance not run; complete these before declaring Facebook PASS.
- [ ] First-party Meta GraphQL/JSONL response filtering with real traffic fixtures, verified license compatibility, and strict fail-open schema checks.
- [ ] Real Facebook DOM safety/performance inspection: live feed, right rail, Marketplace, mobile, recycled cards, Messenger and Contacts.

## Build 261 / v0.3.231: complete targeted MIT Facebook DOM integration
- [x] Add desktop Marketplace Sponsored tile resolver (never entire grid; ordinary listing/body text preserved).
- [x] Add mobile html-renderer feed-card detection and an event-triggered reveal recheck for virtualized posts.
- [x] Preserve ephemeral/id-based Sponsored text from late or removed text nodes; ignore normal text.
- [x] Add author-header guards and bound all ancestor climbs, preventing accidental whole-feed or sibling-post hides.
- [x] Run seven isolated Facebook regression scenarios (all passed), add committed Node fixtures.
- [x] Remove Nougat Media Plus from both public website project-link sections and update three-link regression fixture.
- [ ] Owner Firefox acceptance of Facebook feed, rail, mobile and Marketplace; preserve organic posts, Contacts, Messenger.
- [ ] Full Ubuntu Node suite and Firefox timing audit; GraphQL/streamed response filtering remains a separate investigated technique, not a finished feature.
- [ ] Finish supported Meta formats beyond Facebook in dedicated adapters, with feature-specific tests.

## Build 260 / v0.3.230: Facebook pre-test engineering defects and diagnostics
- [x] Fix byline scan prematurely rejecting supported character-split Sponsored labels.
- [x] Fix right-rail ad-link resolver repeatedly inspecting only the immediate link parent.
- [x] Separate generic cosmetic-policy exception from explicit Facebook ad-recognition policy, preserving full element-hide and user allowlist opt-outs.
- [x] Add count-only Facebook detector checks and safe JSON export in a collapsed Meta Intelligence section (no private content collected).
- [x] Run isolated feed/rail simulations and add corresponding Node regression fixtures.
- [ ] Owner Firefox acceptance: visible feed Ad, two right-rail Sponsored ads, scrolling updates, and protection of organic posts/Contacts/Messenger.
- [ ] If missed ads persist, use exported aggregated scanner diagnostics before proposing another detection patch.
- [ ] Run full Ubuntu Node test suite and real Firefox performance test before any public release.

## Build 259 / v0.3.229: Russian-first interface localization
- [x] Add a persistent **Interface language** selector in both popup and Options/Settings, independent of regional ad filter subscriptions.
- [x] Ship Russian as the first additional selectable UI locale, with English as baseline/fallback; no remote translators or new permissions.
- [x] Record later targets: Arabic (ar), Turkish (tr), Urdu (ur), Persian/Farsi (fa). Do not add unsupported locale buttons.
- [x] Translate primary popup controls and Settings section headings; keep dynamic translation scoped to extension UI pages.
- [x] Run isolated Russian-to-English switch smoke test and add regression fixture.
- [ ] Complete Russian localization for longer Settings explanations, error/status messages and secondary tools.
- [ ] Verify persistence, long text wrapping and Firefox UI in a real browser, and have a fluent speaker proofread.
- [ ] Localize Arabic, Turkish, Urdu, and Persian/Farsi with explicit right-to-left testing for ar, ur and fa.
- [ ] Return to Meta sponsored feed/right-rail acceptance, Agent Nesty cookie enforcement, and full test suite without feature regressions.

## Build 258 / v0.3.228: Agent Nesty numbered identity registry
- [x] Replace plural naming with the singular **Agent Nesty** brand and assign stable `agent_nesty_1` / `agent_nesty_2` / `agent_nesty_3` identities.
- [x] Display each agent's ID, specific job and real armed/standby state in the Cookie Watch page.
- [x] Keep HTTP watcher passive; browser-change and JavaScript watcher not armed or claimed to be implemented.
- [x] Run isolated JavaScript syntax checks and value-redaction/wake smoke test; add regression fixture.
- [ ] Wire tested Firefox cookie-change and JavaScript-write hooks using the agent IDs, without collecting values.
- [ ] Add functional per-cookie controls with user-approved persistence and minimal permissions.
- [ ] Add requested extension display-language selector independently of regional filter-list subscriptions.
- [ ] Full Linux Node suite, Firefox cookie workflow and Meta ad acceptance.

## Build 256 / 0.3.226: cookie intelligence and user-directed controls foundation
- [x] Document a dedicated Cookie Intelligence & Control Center with per-cookie Allow/Block, site+domain+name scope, observed setting attempts, timestamps, metadata, verified ownership/purpose, opt-in collection and cleanup.
- [x] Add bounded cookie metadata sanitizer and in-memory decision model; no values, account tokens, cookies, full URLs or raw headers persisted.
- [x] Run isolated model checks and add regression fixtures; no browser cookie permission or enforcement activated.
- [ ] Implement permission-aware Firefox cookie inspection and request/event evidence, without altering existing consent settings or user logins.
- [ ] Add scoped, **functional** Allow/Block toggles in a separate viewer with clear/history and user-approved persistent rules; distinguish Set-Cookie interception from removal-after-set.
- [ ] Test authentication, video streaming and site breakage prior to any default cookie behavior change.

## Build 255 / 0.3.225: literal Sponsored menu and full Facebook post recovery
- [x] Fix exact "Open menu for Sponsored content" being rejected by an overstrict label regex.
- [x] Prefer largest safely bounded complete Facebook card over header-only containers; accept advertiser link headers, reject multi-post wrappers and feed boundaries.
- [x] Synthetic tool run verified literal menu recognition and card selection; committed unrun Node fixture.
- [ ] Owner browser retest of the Facebook sponsored feed and right rail, plus normal posts, contacts and Messenger. Still no verified PASS.
- [ ] Full Linux regression suite before release.

## Build 254 / 0.3.224: Meta delivery matrix and sponsored-post detection
- [x] Inventory 24 documented ad delivery/advertising-assistance mechanisms, from GraphQL/JSONL through DOM, images, video, canvas, attribution and anti-adblock.
- [x] Implement a read-only signal + contextual-evidence catalog under the Meta adapter; review/observe only, no speculative auto-blocking.
- [x] Show the inventory in a collapsible section of the existing Meta Intelligence viewer, without moving existing controls.
- [x] Correct nested list-position post-count handling and prefer real feed landmarks; add strict two-span "Ad" decoding.
- [x] Add regression cases and perform small source-level JavaScript smoke evaluations; full Node suite and Firefox remain pending.
- [ ] Instrument ad-scanner misses and compare exact DOM of remaining feed/rail ads with MIT reference.
- [ ] Implement narrow, licensed Meta GraphQL/JSONL filtering only with proven response fixtures and reversible fallback.
- [ ] Cover Instagram, Threads and WhatsApp with their own tested adapters.
- [ ] Owner Facebook retest must verify Sponsored feed, right rail, organic posts, contacts, Messenger and video before a PASS.

## Build 253 / 0.3.223: Elderred project websites and Facebook Sponsored rail fallback
- [x] Add separate "More from Elderred Softworks" website-link section above the DK Live Block footer in both Pages entrypoint copies, including Hanafi Learning Deck, Folkhold, Nougat Media Plus and Capital & Consequence.
- [x] Verify three published addresses against official READMEs; Capital & Consequence Pages site requires live availability check and possible main/(root) Pages-source configuration (old homepage metadata still says federalelectric).
- [x] Add a bounded Facebook right-rail detector for a visible Sponsored label rendered as an ordinary span, preserving DK exceptions and normal sidebar sections.
- [x] Test sponsored-rail and Contacts fixtures in a JavaScript evaluation, add Node regression fixture files; full suite not executed.
- [ ] Confirm new Capital & Consequence Pages address is live and update repository About → Website metadata.
- [ ] Owner Firefox acceptance for sponsored feed posts, right sidebar and ordinary content. Facebook remains unverified.

## Build 252 / 0.3.222: first selective MIT detector integration
- [x] Keep original DK Meta module and Facebook scanner; upstream MIT extension stays vendored but not executed independently.
- [x] Extend explicit Ad/Sponsored feed header detection to advertiser links, rather than only h2/h3/h4 author headings.
- [x] Keep safe-card geometry, exact label evidence, exceptions and reversible hiding; do not introduce suggested/unfollowed removal.
- [x] Add targeted source fixture and verify JavaScript compilation.
- [ ] Verify feed and right-rail examples from owner screenshot in real Firefox. Facebook still FAIL until retested.
- [ ] Examine deeper MIT right-rail and whole-post techniques; integrate only testable techniques with no DK behavior regression.
- [ ] Run full Ubuntu Node suite before acceptance.

## Build 251 / 0.3.221: complete MIT Facebook source incorporated for integration
- [x] Copy the complete MIT Facebook Sponsored/Ad blocker source into `src/vendor/facebook-sponsored-upstream.js` with its original license.
- [x] Compare upstream standalone architecture with DK site pauses, per-site exceptions, Facebook Ad Investigator and Meta adapter.
- [x] Review uBlock's active Facebook quick fixes separately; uAssets is GPL-3.0 and its scriptlets require engine integration.
- [x] Preserve existing runtime by keeping standalone upstream code **not activated** pending compatibility extraction.
- [ ] Integrate proven upstream **Sponsored and Ad** feed/rail detection into DK Meta adapter, rather than load competing standalone extension.
- [ ] Retest Facebook screenshot cases: "Ad" post plus two "Sponsored" rail ads, no ordinary-post false positives.
- [ ] Run Linux automated tests and owner Firefox acceptance; Facebook is currently FAIL, not solved.

## Build 250 / 0.3.220: Facebook exception recovery and diagnostics (test milestone)
- [x] Correct a stale hidden-card path so newly matching exceptions restore cards during future scans.
- [x] Add bounded, local diagnostic counters to Facebook recognizer and Meta adapter, without collecting page content.
- [x] Compile-check changed JavaScript and commit focused regression tests; full Node suite remains unexecuted.
- [ ] **Owner Firefox acceptance now needed:** test Facebook Sponsored feed posts and right-sidebar units after refreshing the existing extension. Confirm ordinary posts, Messenger and video playback remain functional.
- [ ] If any ads survive, capture the specific element's Ad Investigator evidence before developing further ad-specific rules.
- [ ] Run full Ubuntu regression suite before public release, especially established YouTube ad blocking.

## Build 249 / 0.3.219: evidence quality and provider hostname safety
- [x] Validate provider hostname labels and normalize DNS case.
- [x] Preserve both allowed and blocked evidence across successive third-party observations.
- [x] Avoid promoting traffic frequency into proof of advertising or ownership.
- [x] Add focused regression tests and build notes.
- [ ] Run tests in a Linux environment with the checked-out repository and verify Firefox live behavior.
- [ ] Add reviewed provider classifications, independently validated Meta adapters, and opt-in evaluation of proposed countermeasures before automatic activation.

## Build 248 / 0.3.218: Meta intelligence viewer
- [x] Show local third-party hostname observations with allowed/blocked counts in a dedicated extension-only page.
- [x] Provide refresh/confirmed-clear actions and a Meta-site-only Site Dashboard link, without moving existing controls.
- [x] Add source regression assertions and document privacy limitations.
- [ ] Run Linux tests and real Firefox acceptance, especially Facebook Sponsored posts and legitimate Messenger/navigation.
- [ ] Independently verify actual advertising providers before enabling provider-specific countermeasures.

## Build 247 / 0.3.217: bounded local Meta provider counters
- [x] Count allowed and blocked third-party requests by hostname, with 100-host and 100,000-event counter caps.
- [x] Preserve the unknown/unverified classification regardless of traffic volume; never infer advertising from request counts alone.
- [x] Support clearing from the existing extension-only command and request-logging-off control.
- [x] Add focused tests; local execution remains pending.
- [ ] Connect provider reports to a UI after owner approval of geometry; establish ownership with public evidence.
- [ ] Investigate genuine ad-specific patterns, build safe cross-site countermeasures, independently validate Meta adapters.
- [ ] Run Linux/Firefox tests. Facebook success remains unverified.

## Build 246 / 0.3.216: inspect and clear Meta provider intelligence
- [x] Add extension-only, active-Meta-tab-gated observation read and explicit clear commands.
- [x] Suppress returned observations when request logging is disabled; bounded local store only.
- [x] Add contract tests and implementation notes; tests not executed in this connector environment.
- [ ] Surface data in an owner-controlled Meta intelligence dashboard; display unknown vs verified provider ownership.
- [ ] Develop reviewed cross-company countermeasures backed by live evidence and provider-specific false-positive tests.
- [ ] Run Linux test suites and Firefox live ad tests. Do not declare Facebook, Meta, or company-intelligence feature complete yet.

## Build 245 / 0.3.215: privacy-preserving Meta third-party observations
- [x] Observe limited, hostname-only Meta page third-party destinations from existing request monitor events when user request logging is enabled.
- [x] Treat destinations as unknown rather than assuming advertising ownership; never retain URLs or payloads in provider intelligence.
- [x] Clear new intelligence memory when request logging is disabled.
- [x] Add focused source tests and engineering documentation.
- [ ] Add local grouped inspection controls and evidence review for provider identity and behavior.
- [ ] Run full tests/real Firefox and verify Facebook auto-hiding before marking success.
- [ ] Expand independently tested Meta-platform adapters and shared advertising countermeasures once evidence supports them.

## Build 244 / 0.3.214: provider evidence and live Meta module
- [x] Add bounded in-memory provider intelligence records and an explicit clear operation, no telemetry or inferred ownership.
- [x] Add evidence-driven adaptive dispatcher whose outputs are review-only, not self-issued network rules.
- [x] Create Meta adapter, routing existing Facebook ad detection through company module without touching YouTube engine.
- [x] Add tests for adapter isolation and manifest order; local and real browser execution remains pending.
- [ ] Wire privacy-preserving local request monitor summaries to provider intelligence without retaining full URLs or personal content.
- [ ] Build independently validated Instagram, Threads and relevant WhatsApp ad-surface detectors.
- [ ] Measure false positives, user corrections and candidate efficacy before enabling auto-changing rules.
- [ ] Run Linux Node suite and owner Firefox tests; Facebook Sponsored posts/right rail still not verified as solved.

## Architecture directive: Company modules + advertising-provider intelligence (November 1, 2026)
See [Company Advertising Intelligence](COMPANY_ADVERTISING_INTELLIGENCE.md) for the full owner-approved direction, planned architecture, evidence schema, operational boundaries and verified-vs-planned status.
- [x] Document per-company modules, Meta scope (Facebook, Instagram, Threads, WhatsApp), existing YouTube protection, shared advertising-provider intelligence and reversible countermeasures.
- [x] Document multi-layer dormant/adaptive detectors and AI-assisted investigation, including the limitations of scores, shared CDNs and weak signatures.
- [ ] Implement a real provider-profile registry backed by evidence, local request-metadata classification and owner review controls.
- [ ] Isolate Meta platform adapters and retain independent YouTube functionality.
- [ ] Implement and test a bounded adaptive detector dispatcher and AI candidate evaluation; do not activate speculative blocking automatically.
- [ ] Prove live Facebook ad removal, no false-positive damage, and unchanged streaming/login before advancing to other Meta platforms.

## Build 243 / 0.3.213: company-scoped modules
- [x] Establish an immutable Meta and YouTube company/platform registry with strictly bounded hostname routing.
- [x] Wire Facebook DOM detection to Meta's Facebook platform only; preserve YouTube engine untouched.
- [x] Add source tests for exact-domain ownership, cross-platform isolation and suffix confusion.
- [ ] Build independently tested Instagram and Threads advertising adapters before enabling automatic hides there.
- [ ] Inspect company-specific advertising request *metadata* locally with user-controlled logs; avoid private conversations, credentials or invasive data collection.
- [ ] Validate live Facebook auto-hiding and run Linux test suite before declaring Meta/Facebook victory.

## Build 242 / 0.3.212: Facebook competitor-code review and independent card detection
- [x] Examine the maintained MIT Facebook-specific blocker, Mowd's feed filter, uBlock-compatible feed-category scriptlet, and older Facebook blocker approaches.
- [x] Make sponsored-menu card identification work independently of the optional investigator, using bounded landmarks and single-post safety checks.
- [x] Recheck short Facebook labels arriving after initial render; preserve existing mutation observer and site exceptions.
- [x] Add isolated source regression fixtures and document known false-positive traps.
- [ ] Run the complete Node suite, test Facebook feed/right rail in actual Firefox, confirm ordinary posts/contacts/Google login/playback. **Do not claim Facebook PASS until observed.**
- [ ] If needed, investigate opt-in category-based response filters only after safe GraphQL schema and false-positive review.

## Build 241 / 0.3.211: manual scriptlet expansion and Facebook scanner independence
- [x] Add explicit user-authored, domain-bound `abort-on-property-read` scriptlet with reversible teardown and protected-global restrictions; disabled by default everywhere.
- [x] Remove the generic ad recognizer as a prerequisite for Facebook-specific ad scans.
- [x] Add focused regression tests and build documentation.
- [ ] Run the local Node suite and full Ubuntu regressions, then check live Facebook feed and right-rail Sponsored cards in Firefox. **Facebook remains unverified.**
- [ ] Investigate missing cards using evidence-driven selectors or safe scoped procedural rules; do not apply aggressive GraphQL response rewriting without extensive compatibility tests.

## Build 240 / 0.3.210: fix oversized Site Dashboard sliders
- [x] Owner screenshot showed Block switches stretched to roughly 175 pixels in request rows. Diagnosed the old `.site-dashboard .dashboard-line span { flex:1 }` rule affecting nested `.dk-toggle`, its track, and caption.
- [x] Override only those Site Dashboard nested switch elements: intrinsic wrapper, fixed 48-pixel track, non-growing action caption. Leave destination hostname/description flexible, allow normal wrapping, and preserve 340px popup, all other dashboard geometry, existing checkbox handlers and request scope.
- [x] New focused source regression test verifies that the root cause exists and the fix outranks it. JS syntax validation performed; full Ubuntu and Firefox tests still pending.
- [ ] Owner Firefox acceptance: Site Dashboard permitted/blocked request controls show compact 48px sliders at desktop and narrow viewport widths. Test mouse, keyboard, confirmation, undo/disable, and monitor switches.
- [ ] Full Ubuntu seven-phase suite and actual Firefox UI evaluation remain outstanding.

## Build 239 / 0.3.209: Owner-controlled investigator + browser portability foundation
- [x] Integrate the **existing** on-page draggable Ad Investigator with read-only bounded DOM hierarchy, outline and cosmetic selector match checks, plus direct links to the original Network Monitor, rule-provenance Site Dashboard and Cosmetic Debugger. Never claim CSS matches prove a hide was applied.
- [x] Keep manual hide/undo/selector draft, site exception preferences, no-upload privacy, and selected panel position on repeat inspection.
- [x] Network Monitor: opt-in, in-memory third-party hostname/resource groups, counted from actual captured traffic, linked to existing reversible host/type Allow and Block controls. Purpose hints remain unverified, not automatically bad.
- [x] Owner interface: original DK icon + **LIVE BLOCK** header text, cyan primary/white investigation/black secondary popup actions and accessible sliding switches for protection and Allow/Block. Preserve popup size and public website geometry.
- [x] One-source, three-target architecture foundation: data-only Firefox/Chrome/Edge target manifest, pure runtime capability selection, read-only packaging plan, strict Firefox candidate delegation, and fail-closed Chrome/Edge gates until MV3 DNR adapter and actual browser tests exist. Firefox remains the only active runtime.
- [x] Keep public marketing free of adult-content and piracy-site names; independent test records remain in internal docs, not the README.
- [x] Eight focused inspector tests passed in isolated JavaScript and compatibility smoke checks for Firefox/Chrome/Edge passed. Dedicated five-case compatibility test registered for the Linux suite. **Full seven-phase Ubuntu tests and real Firefox UI acceptance not run**.
- [ ] Validate in real Firefox: investigator on Facebook; preserved sign-in including Google account creation; new Network Monitor views, Allow/Block toggles, disabled/error states, keyboard accessibility and actual automatic Facebook ad removal.
- [ ] Port blocking logic and lifecycle to Chrome/Edge Manifest V3 declarativeNetRequest without losing safety, explainability or controls; only then produce and test three packages. No parity claim or release.
- [ ] Broader real-browser tests, release dependencies, signing, and owner acceptance still pending. No new GitHub Actions or new branch.

## Build 238: Auto-hide Facebook posts recognized by the Ad Investigator (0.3.208)
- [x] Repair the confirmed mismatch between manually inspected Facebook Sponsored feed posts and automatic detection: share the existing bounded Ad Investigator card resolver and explicit `sponsoredMenu` evidence, **not** the AI score, to select a safe full post.
- [x] Recognize sponsored-content accessible menus despite trailing spaces or formatting that defeats an exact CSS suffix selector, even without role=article / FeedUnit wrappers.
- [x] Apply user site exceptions, including matching the sponsored menu itself; restore automatically hidden posts when the owner adds an exception.
- [x] Limit read-only menu candidate scans and rotate through long feeds. Protect ordinary posts, dialogs, navigation, other sites, existing streaming paths and approved UI.
- [x] Fifteen isolated existing + new Facebook JS tests passed, including owner-like screenshot fixture, undo, consented exceptions, organic text, protected contexts and long-page rotation.
- [ ] **OWNER FIREFOX TEST:** After updating the existing extension, reload Facebook and verify sponsored feed posts hide automatically before opening the investigator. Check the right-side Sponsored section independently and preserve ordinary posts, Messenger, Reels, navigation and comments.
- [ ] Full seven-phase Ubuntu regression suite and independent real Firefox/uBlock comparison remain open. Facebook **NOT YET PASS**.

## Build 237: Movable Ad Investigator (0.3.207)
- [x] Grab and hold the investigator title bar to move the instruction or result window away from a Facebook Sponsored label.
- [x] Keep the panel on-screen; retain its position when viewing results; arrow keys move the focused title (Shift for larger steps).
- [x] Clean up pointer listeners on release, cancel and close, without selecting or hiding page content while dragging.
- [x] Register existing investigator tests in standard Ubuntu runner and add title/drag lifecycle regression assertions.
- [ ] Owner Firefox acceptance: verify the panel moves and does not obscure Sponsored text.
- [ ] Facebook automatic filtering remains a FAIL in actual Firefox. Manual right-click Block element successfully removed a Sponsored word, not an entire ad.
- [ ] Full Linux suite and real browser acceptance still pending; unchanged site protections.

## Build 236: Owner-controlled local AI Ad Investigator (0.3.206)
- [x] Preserve the existing 256-example synthetic YouTube playback model, its parameters and working fallback behavior.
- [x] Add a separate, reproducible offline ad-evidence ranking model trained on 64 synthetic binary cases. An evidence score is **not** real-world ad probability or autonomous blocking intelligence.
- [x] Add **Investigate missed ad · Local AI assist** to the existing Firefox popup, launching a user-controlled hover-and-click inspection on the active webpage.
- [x] Explain locally detected advertising signals, relevant site-level element-hiding exceptions and uncertainty without sending DOM text, account details, visited URLs, cookies or request logs anywhere.
- [x] Offer page-only **Hide this page item**, undo from the existing popup button, and a unique narrow selector draft that the user may copy. Nothing is silently installed, changed permanently or shared.
- [x] Keep the inspector dormant except for explicit owner requests; retain protected form/dialog/navigation roots and fixed scan ceilings; include a self-contained training script and regression tests.
- [x] Six new targeted integration/model cases and the 64 synthetic model combinations executed without failures in an isolated JavaScript runtime (not the full local Ubuntu test suite).
- [ ] OWNER: update existing local installation and test Facebook's feed and right Sponsored rail. Check that true posts, chat, navigation, and other known-good streaming/popup sites remain functional.
- [ ] AI validation gates: compare model recommendations to human-labeled cases, audit privacy/performance and protected content, improve selector proposals with owner review before any permanent rule installation. No real-world accuracy claim.
- [ ] Full Ubuntu seven-phase suite and live Firefox acceptance pending. No public competitor parity claim.

## AFTER FACEBOOK: AI-assisted missed-ad investigation (PLANNED, not implemented)
- [ ] Build on existing synthetic local YouTube playback model; do not misrepresent it as a current Facebook ad classifier.
- [ ] User-initiated **Why wasn't this blocked?** investigation for a selected page item; explain detector evidence, rule/exception decisions and unrecognized content.
- [ ] Let the user preview a narrow, site-scoped proposed filter, explicitly approve it, and reverse the choice. Never silently create filters or allow ads.
- [ ] Use a local, self-contained model with no required downloads or remote AI APIs; avoid telemetry and protect personal page text, cookies, logins and URLs.
- [ ] Benchmark against rule-only decisions, including false positives, safety, performance and opt-in owner control before claiming AI recognition.

## Build 235: Facebook ARIA/SVG portal labels (0.3.205)
- [x] Decode external SVG/ARIA labels and split-character referenced words with the existing bounded decoder.
- [x] Cache only exact Ad/Sponsored words when React removes reference targets; trigger scans on removal and relevant text change.
- [x] Inspect author bylines that point to external nodes without hiding feed roots, ordinary timestamps or contacts.
- [x] Three new regression checks plus seven older Build 233-234 cases passed in isolated JS execution.
- [ ] Facebook owner retest, main-feed Sponsored posts, right-side Sponsored column and ordinary navigation.
- [ ] Full local Ubuntu seven-phase suite remains pending; do not claim Facebook PASS or competitor parity.

## Build 234: Facebook detection using established blocker evidence (0.3.204)
- [x] Study uBlock Origin's published Facebook quick-fixes and the MIT Facebook-sponsored-post specialist. Adapt concrete right-rail ad-link signals: rhcad2, privacy-sandbox ad attribution and complete campaign parameter bundles.
- [x] Restrict ad-link matches to narrow right-column modules, not Contacts, Messenger, dialogs, feed or navigation.
- [x] Apply the specialist's proven performance safeguard: decode CSS ordered split-character labels only for plausible short character-span runs; avoid expensive style flushes on ordinary feed elements.
- [x] Extend narrow feed-card fallback to explicitly detected short 'Ad' bylines when an author/header layout supports it.
- [x] Add tests for campaign fingerprints, false positives, sidebar bounds, undo and split-label performance.
- [ ] **OWNER BROWSER TEST:** Facebook feed and right-rail Sponsored content; ensure normal posts, contacts, groups, navigation, Messenger, Marketplace and Reels remain usable.
- [ ] Compare observed results side by side against uBlock Origin. Consider proven Facebook GraphQL techniques only with explicit safety tests; no broad host blocking or unreviewed response rewrites.
- [ ] Full on-machine Ubuntu suite and long-session browser checks remain open; not a Facebook PASS or competitor-parity claim.
- [x] Preserve existing accepted sites, website button geometry, one-branch main-only rule and no GitHub Actions.

## Build 233: Facebook sponsored feed and sidebar follow-up (0.3.203)
- [x] Recognize explicit Facebook sponsored-content action-menu accessibility labels without relying on a bare 'Ad' text label.
- [x] Identify narrow Sponsored right-rail sections even without role=complementary; stop at Contacts, friends, navigation, or broad sidebar containers.
- [x] Support bounded nested split-character labels and a safe feed-card fallback for structurally marked advertisements.
- [x] Preserve ordinary posts, forms within posts, site exceptions and reversible hiding; cover dynamic React/pagelet mutations.
- [x] Add focused regression fixtures based on the reported feed and rail misses.
- [ ] **OWNER TEST REQUIRED:** retest Facebook feed and right sidebar with DK enabled after refreshing/updating the unpacked extension; ensure legitimate posts and controls still work.
- [ ] Reels, Marketplace, scrolling, site performance, complete Linux suite and competitor-parity acceptance remain open.
- [x] Preserve approved website buttons and previously accepted YouTube, Disney+, CBS, XNXX, 1337x and Pirate Bay code paths.

## Build 232: XNXX and Facebook site acceptance (owner results, November 1, 2026)
- [x] Target the top XNXX.GOLD premium upsell with exact text, link hostname, geometry and player protections.
- [x] Add MIT-attributed Facebook byline/ARIA/SVG/character-split ad labeling and bounded sidebar/feed removal.
- [x] **XNXX PASS:** Owner accepted Build 232 in live Firefox. Preserve this site's working protections.
- [ ] **Facebook FAIL:** Owner screenshot confirms a labeled Ad in the feed and Sponsored right-rail placements still display. Fix recognition without hiding genuine content.
- [ ] **Facebook still to check:** Reels, Marketplace, groups, contacts and long scrolling after a fix.
- [ ] **CBS PROVISIONAL:** Playback currently works, with longer ad-break recheck pending.
- [ ] Keep owner-observed YouTube, Disney+, 1337x and Pirate Bay successes unchanged.

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

## Cross-browser support (planned; Firefox remains the reference build)

**Goal:** DK Live Block should be available on all major desktop browsers, with mobile support where the browser permits extensions. No existing Firefox behavior, filter coverage, privacy settings, or playback reliability may be sacrificed to claim cross-browser support. All ports are future work, not shipping or verified today.

- [ ] **Mozilla Firefox (desktop, Linux/Windows/macOS):** finish the existing Firefox release, CBS playback repair, browser acceptance, and signed permanent-install distribution.
- [ ] **Google Chrome:** build a separate Chromium Manifest V3 package and adapt network blocking to `declarativeNetRequest` plus compatible APIs; document limitations and test real ad blocking rather than reusing the Firefox XPI.
- [ ] **Microsoft Edge:** package and test the Chromium MV3 build for Edge's add-on distribution and permissions behavior.
- [ ] **Brave, Opera, and Vivaldi:** validate the Chromium MV3 package in each browser, including extension UI, filter updates, video playback, popup rules, and native helper support. Publish dedicated instructions/store listings where appropriate.
- [ ] **Apple Safari (macOS):** investigate a Safari Web Extension build, Apple signing/distribution requirements, and differences in filtering and extension APIs; only advertise parity after real macOS Safari tests.
- [ ] **Firefox for Android:** assess support for the extension's APIs and mobile UI, test Android-specific restrictions, and publish only after device validation.
- [ ] **Samsung Internet / Safari on iPhone and iPad:** research whether their supported extension/content-blocker systems can implement DK Live Block's features; treat these as separate mobile adaptations, not automatic compatibility from desktop packages.
- [ ] **Cross-browser maintenance:** shared filtering core with browser-specific adapters/manifests; capability matrix and honest feature disclosures; per-browser regression tests, manual live playback/ad checks, update and signing strategy, and independent release approvals.

**Sequence:** finish Firefox first; then Chrome/Edge and the other Chromium browsers; then Safari and mobile browsers. No GitHub Actions or automatic store submission. Browser store policies and signing are distribution requirements, not permission to silently change product design.

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
- [x] Document the owner's rule: individuals and companies may use DK Live Block for free, but may not sell or monetize DK Live Block itself or paid derivatives.

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
- [ ] Check required third-party licenses and attribution before importing external code or filter lists.

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

- [x] Build 140: automatic DOM ad recognition now refreshes the stored rollback style whenever a website changes and the extension re-hides a tracked ad container, aligning with procedural cosmetic restoration.
- [ ] Complete Linux suite and live Firefox dynamic-ad DOM acceptance pending.

- [x] Build 141: inspect YouTube page-world feed objects via own data descriptors rather than calling userland getter properties; reject accessor-backed or sparse arrays before editing any ad entries.
- [ ] Browser/Firefox real feed compatibility and full local suite pending.

- [x] Build 142: MAIN-world player JSON inspection now reads known own data descriptors rather than invoking page-defined getter properties, preserving refusal status and signed media fields.
- [ ] Full Firefox playback and Linux regression suite remain open.

- [x] Build 143: identify explicit Google Ad Manager `data-google-query-id` ad slots in the reversible DOM recognizer, including dynamically assigned attributes. Other query IDs and protected login/form/video contexts remain untouched.
- [ ] Complete Firefox dynamic ad slot/browser performance and local suite still pending.

- [x] Build 144: reject parameter-removal network rules using request-target scope, denyallow, redirect or other semantics not implemented by the navigation cleaner. Avoid unexpectedly broader query rewrites.
- [ ] Full local and Firefox signed-link/scope tests still pending.

- [x] Build 145: first-party privacy cleaner now removes bounded custom `utm_` campaign variants by default, without waiting for an external subscription. Whole-URL signing/auth safeguards remain authoritative.
- [ ] Real Firefox signed navigation and full offline suite acceptance pending.

- [x] Build 146: detect Google Ad Manager iframe name-based ad slots and attribute changes, with strict naming and protected-sign-in/media safety.
- [ ] Full Firefox dynamic iframe and local suite acceptance remains pending.

- [x] Build 147: built-in private navigation cleaner recognizes additional exact search/social click identifiers (`srsltid`, `twclid`, `li_fat_id`, `epik`), retaining signing and authentication protection and ordinary query fields.
- [ ] Complete Firefox click-link tests and full offline suite pending.

- [x] Build 148: recognize slash-form Google Ad Manager frame IDs and names, including path-like advertising inventory identifiers, while retaining exact `google_ads_iframe_` prefix and short bounded character set.
- [ ] Real Firefox Google ad iframe and full local suite tests pending.

- [x] Build 149: reject request-only resource-type and third-party constraints attached to top-level `$removeparam` rules, avoiding silently ignored modifiers. Preserve document/first-party-compatible query cleanup.
- [ ] Firefox and complete offline filter suite pending.

- [x] Build 150: extend local cross-feature regression contract for class/ID cosmetic exceptions, getter-safe and refused YouTube JSON, exact ad-frame recognition, private tracking cleanup and ambiguous-charset stream protection.
- [ ] **Release gate remains blocked:** full Ubuntu Node/Python suite, live Firefox YouTube/Disney+ (video, Shorts, free-with-ads films), resource use, security, and owner-approved snapshot/tag/release.

- [x] Build 151: avoid page-controlled splice and constructor/Species getters during eligible YouTube sponsored feed/Shorts removal; preserve ordinary entries and global read-only preflight, with both feed and MAIN-world fixture tests.
- [ ] **Release still blocked:** complete Ubuntu regression and Firefox ad-free *and* playable video, Shorts, ad-supported films, streaming compatibility, performance, security and owner-approved tag.

- [x] Build 152: preserve outer and nested YouTube playback refusal evidence in both background and MAIN-world response paths; reject ambiguous malformed inner JSON before any outer mutation.
- [ ] Full Ubuntu, Linux companion, and live Firefox anti-adblock/ad-free playback acceptance outstanding.

- [x] Build 153: add bounded first-party YouTube resolve_url prefetch player ad-metadata filtering in both Firefox stream and MAIN-world paths, restricted to one schema and original POST/hostname/content-type safety gates.
- [ ] Real Firefox video-prefetch navigation, anti-adblock enforcement, all stream response integrity, ad-free replay and full Ubuntu suite remain open.

- [x] Build 154: remove recognized ad-only metadata from bounded stringified resolve_url prefetch playerResponse, with fail-open refusal and page-world read-only checks; preserve ordinary media/navigation data.
- [ ] Full Linux/Firefox acceptance and actual no-ads + working-video evidence outstanding.

- [x] Build 155: surface privacy-preserving player/prefetch refusal counts and distinguish prefetch requests, without mislabeling an unchanged refusal as blocked advertising.
- [x] Build 155: avoid duplicate original bytes after a failed attempted modified Firefox stream write, while preserving pre-write fail-open behavior.
- [ ] Full Ubuntu JavaScript/Python suite, Firefox stream fault injection, YouTube anti-adblock/live video/Shorts/movie ad-free playback, Disney+ and owner acceptance remain unverified.

- [x] Build 156: eliminate repeated automatic skip scans caused by ordinary progress UI changes; retain actual preroll, midroll and player-root ad-state detection.
- [ ] Firefox live skip and ad-free playback, memory/CPU baselines, and full Ubuntu Node/Python regression remain outstanding.

- [x] Build 157: align the YouTube skip controller and watcher for explicit alternative/localized ad labels and title-only Skip Ad buttons, with strict player context and Skip Intro protection.
- [ ] Real Firefox ads, anti-adblock refusal, full Ubuntu Node/Python suite, signed snapshot and owner acceptance outstanding.

- [x] Build 158: report coarse opt-in YouTube ad-skip button clicks with strict first-party top-frame validation and distinguish them from successful ad blocking.
- [ ] Full Ubuntu Node/Python testing, actual ad-free YouTube playback and Disney+ validation, resource baseline, security audit and accepted snapshot/tag remain open.

- [x] Build 159: ensure native $document/$elemhide/$generichide website exceptions also govern bundled Ghostery cosmetic hiding without needlessly discarding site-specific selectors.
- [ ] Verify Ghostery filter policy integration, temporary website exceptions and authorized media playback in real Firefox; full Ubuntu suite remains open.

- [x] Build 160: make explicit $elemhide/$generichide exceptions suppress generic automatic DOM ad recognition on the affected website; preserve scoped styles, and restore ordinary recognition when the exception is removed.
- [ ] Verify dynamic DOM restoration against site exceptions with real Firefox, plus full Ubuntu regression/streaming acceptance.

- [x] Build 161: repair the three documented test-side failures and remove fail-fast behavior from the offline gate; retain a nonzero final exit on any failed phase, summarize seven phases and aggregate Node TAP counts, and add deliberate-failure self-tests.
- [ ] Build 161 acceptance: execute the complete seven-phase runner against this exact GitHub commit in a local Ubuntu checkout; record exact Node/Python counts and any remaining failures. Source-only review is not a green result.
- [ ] Build 162: instrument offline native-versus-Ghostery network verdict comparisons, including unsupported exception and redirect fixtures, without changing production precedence.
- [ ] Build 163 (only after green gate and differential evidence): separate authoritative subscription decisions from explicit DK user/site overrides; test login, media, popup and override safety.

- [x] Build 162: local-only bounded native/Ghostery/production differential observer; synthetic exception, redirect/rewrite, method and page-policy examples; official runner inventory now includes the Build 161 runner self-test and Build 162 observer test.
- [ ] Build 162 acceptance: full seven-phase Ubuntu test run and exact current-commit pass/fail counts (not yet verified).
- [ ] Build 163: safe production verdict arbitration only after confirmed regressions and exception-rescue differential fixtures.

- [x] Build 163: separate manual user rules from compiled subscription rules for explicit block/allow priority; consult Ghostery exceptions before returning ordinary native subscription blocks; preserve popup, main-frame, page and native important protections.
- [ ] Build 163 full local seven-phase runner and real Firefox auth/media compatibility still unverified.
- [ ] Build 164: improve offline corpus with targeted exception/provenance/redirect cases, filter-syntax coverage measurement and safe adapter tests.

- [x] Build 164: exact-site #@# cosmetic exceptions now protect matching elements against automatic DOM recognition, restore previously hidden elements on update, and prevent supplementary Ghostery CSS from re-hiding exact selectors.
- [ ] Build 164 acceptance: full Linux regression including background and DOM mocks, real Firefox site allow/remove changes and normal ad recognition.
- [ ] Build 165: quantify filtering-language compatibility and unsupported rule categories using bounded offline local list analysis.

- [x] Build 165: offline bounded native filter-language inventory, no URLs logged, with 20 MB / 260k-line limits, synthetic classification tests, and test runner registration.
- [ ] Compare unsupported categories against consented real default-list snapshots; audit does not yet measure installed EasyList/EasyPrivacy or bundled Ghostery's full parser.
- [ ] Build 166: baseline CPU/startup/memory and request-match timing in offline harness, no live browser assertions.

- [x] Build 166: local synthetic native/hybrid parse and request-match benchmark harness, bounded workload and median timings, coarse heap caveat, standalone-only heavy run.
- [ ] Build 166 acceptance: execute benchmark and full Node/Python gate on exact commit; document actual output and regression status.
- [ ] Build 167: measure and instrument YouTube bootstrap path without modifying video traffic; validate privacy-safe capture boundaries.

- [x] Build 167: read-only first-load YouTube bootstrap observations before/after existing cleanup and 1s/3s later. Fixed, coarse fields only; guarded first-party top-frame reports; up to four ephemeral per-tab observations in compatibility TXT/JSON export.
- [ ] Build 167 gate: full Ubuntu seven-phase Node/Python suite including new bridge/response/export tests; live Firefox A/B playback and observational evidence; do not infer success from synthetic probes.
- [ ] Build 168: repeatable, clean-profile YouTube experiment and playback-state matrix before implementing invasive player HTML hooks or outbound API changes.

- [x] Build 168: temporary tab-scoped YouTube test switchboard (combined / Firefox response only / page bridge only / observe-only). Source module is pure and bounded, and all modes are controlled through the existing site dashboard without touching global preferences or default playback behavior.
- [ ] Build 168 gate: run all 7 local test phases and 116 registered Node test files, then do a clean Firefox A/B YouTube playback matrix using exports from each temporary mode. No assertion of working anti-adblock protection before observed results.
- [ ] After initial A/B evidence: focus fixes only on the layer empirically responsible for blocking or playback refusal; no speculative YouTube HTML interception or GPL scriptlet copying.

- [x] Build 169: blocked history now has reversible Allow checkboxes beside existing Details controls, with exact site/host/type scope, persistent remembered decisions, live-tab/observed-event checks, popup/manual-block exclusions and regression coverage.
- [ ] Build 169 acceptance: complete seven-phase local Ubuntu suite on exact Build 169 HEAD, followed by real Firefox toggle-on/off checking; no public release yet.
- [ ] Build 170: use current YouTube bootstrap/report evidence to identify why ordinary-video playback fails while ad-supported Shutter Island can play; preserve observed working movie behavior; avoid speculative rewriting until controlled A/B results.

- [x] Build 170: unify YouTube player/filter observation counters with regular blocked-request TXT/JSON exports; safe allowlist-only data, no content IDs or raw player data, explicit no-incidents caveat. Preserves previously observed Shutter Island playback behavior.
- [ ] Next acceptance gate: run complete Linux suite at exact Build 170 commit, verify blocked-request Allow switch on/off in Firefox and compare a regular YouTube video vs Shutter Island under the same filter/experiment modes.
- [ ] Only after observed regular-video evidence: fix the precise interception/enforcement branch without changing the working movie baseline. No parity or public release claim.

- [x] Build 171: comprehensive source asset closure (background/content/HTML/CSS, icons, redirect resources) with no network calls, missing/remote/traversal fixture tests, and official test inventory registration. Audited 87 references across 10 pages against GitHub HEAD, all present.
- [ ] Verify the full 7-phase Node/Python Linux runner against Build 171 exact commit; full source checkout currently unavailable in the isolated tool runtime.
- [ ] Build 172: safe, bounded new native ABP-compatible filtering options with deliberate parser/runtime regression coverage; preserve working YouTube movie path.

- [x] Build 172: safe, literal-only procedural :matches-attr attribute matching, scoped to explicit website hosts, with exception/duplicate handling and negative/malformed fixtures. No HTML response filtering or arbitrary scriptlets.
- [ ] Build 172 gate: full seven-phase Ubuntu suite and Firefox ad-slot false-positive/regression checks; no verified parity or release claim.
- [ ] Build 173: safer request-control visibility and root-cause diagnostics, preserving video playback while expanding observable filtering capability.

- [x] Build 173: export current Allow/Block host/type switch state beside historical blocked event evidence; retain per-site scopes and privacy.
- [ ] Build 173 verification: full local test suite and real Firefox toggles on/off with reloaded video tab; historical events must remain historical.
- [ ] Build 174: security/privacy review of extension-origin authorization, retained settings and failure recovery.

- [x] Build 174: explicit foreign no-tab messages rejected, multi-field settings inputs prevalidated before mutation, and persistent blocked-request Allow save failures covered by rollback tests.
- [ ] Build 174 acceptance: complete local seven-phase Node/Python suite plus real Firefox message/permissions/settings persistence checks.
- [ ] Build 175: run/offline benchmark native/hybrid filter matching and prioritize measurable optimization while preserving ad-supported movie playback.

- [x] Build 175: reuse parsed request hostname during native candidate selection and bypass token scanning only when no token-indexed rules exist. Keep external candidate API and verdict precedence, add regression cases and synthetic parse-call counter.
- [ ] Build 175 acceptance: full local Node/Python suite and real measured before/after Firefox CPU, memory and browsing responsiveness. No numerical speedup claim without timing data.
- [ ] Build 176: expand offline matching differential/parity corpus with manual exceptions, important rules, domain boundaries and HTTP method cases. Fix only demonstrated mismatches.

- [x] Build 176: bounded late initial-player bootstrap cleanup for 1s/3s plus yt-navigate-finish SPA navigation; preserve observe-only, disable, refusal, stream and UI behavior; export sanitized boolean indicating actual late metadata cleanup.
- [ ] Build 176 acceptance: run all seven Ubuntu test phases and test an ordinary YouTube video through actual preroll/midroll vs Shutter Island in clean Firefox, including observe/bridge/response comparison; record voluntary sanitized exports.
- [ ] Build 177: act on specific Firefox evidence to fix remaining regular-video ad playback or anti-adblock refusal, avoiding speculative blockers that could corrupt legitimate video streams.

- [x] Build 177: inspect uBlock Origin actual GPLv3 scriptlet/JSON-prune implementation and independently add bounded first-party YouTube JSON.parse player-metadata interception without copying GPL sources or executing filter-list scripts.
- [ ] Full local seven-phase Node/Python suite on exact Build 177 tree and real Firefox acceptance including ordinary videos, YouTube midrolls, ad-supported movies, observe/response-only/bridge-only modes and compatibility with other blockers disabled.
- [ ] Build 178: investigate remaining YouTube anti-adblock / player API behavior from the new sanitized logs; fix only a demonstrated failure and keep the movie playback baseline.

- [x] Build 178: use the bundled Ghostery parsed redirect decision for only two vetted extension-owned inert resources; test native-unsupported entity-domain matching, wrong types, exceptions, and unsafe source rejection without copying uBlock GPL code.
- [ ] Run complete seven-phase Linux test gate on exact Build 178 HEAD and compare Firefox video/site behavior with uBlock disabled. Existing YouTube preroll/midroll issue remains unresolved.
- [ ] Build 179: categorize default-filter-list rules skipped by DK's native parser, compare them to actual Ghostery capability, and prioritize tested safe adapters over additional speculative YouTube rewrites.

- [x] Build 179: add safe, domain-scoped hide-only `:style()` support, preserve `#@#` exceptions, `$elemhide` and streaming/identity protections; audit now counts `native_style_hide` separately. No arbitrary CSS or user code execution.
- [ ] Build 179 acceptance: exact-commit full local Node/Python runner and real Firefox cosmetic/ad-video compatibility tests; download-free bundled YouTube filter contains no newly supported style rule, so no YouTube improvement has been demonstrated.
- [ ] Build 180: measure actual hybrid subscription network compatibility (unsupported operator categories, exception and redirect-rule behavior) using real bundled Ghostery and safe synthetic fixtures; implement only a confirmed, scoped gap while protecting playback.

- [x] Build 180: implement and separately test bounded first-party YouTube bootstrap-assignment interception, in addition to existing late retry and JSON.parse instrumentation; safe teardown and observation-only remain mandatory.
- [ ] Run complete Linux test gate and controlled real Firefox matrix on exact Build 180 source, including uBO disabled, normal preroll/midroll and movie playback. Diagnose any anti-adblock refusals before shipping.
- [ ] Build 181: strengthen native/Ghostery rule and exception reconciliation; log meaningful match evidence without leaking private URLs.

- [x] Build 181: resolve measured hybrid precedence mismatch for Ghostery `$important` rules hidden behind incomplete native parsing, while preserving site/manual decisions and source privacy. Verified against real bundled Ghostery in synthetic V8 fixtures.
- [ ] Build 181 full Linux test gate, real YouTube standard video/midroll/preroll, and non-YouTube sign-in/checkout/media regression testing.
- [ ] Build 182: expand measured filter corpus and add only proven, safely applicable rule capabilities. No full scriptlet execution from remote lists.

- [x] Build 182: bounded, independently implemented `:matches-css()` computed-style literal predicate with per-site scopes, exact exceptions and reversible hiding; verified in focused V8 tests.
- [ ] Build 182 acceptance: full seven-phase local Node/Python suite, Firefox style/identity/player behavior and meaningful default-list syntax coverage measurement.
- [ ] Build 183: extend evidence-based network/cosmetic parity with tests against real filter-list patterns; do not enable arbitrary remote scriptlets or CSS and do not claim YouTube success without actual playback proof.

- [x] Build 183: implement bounded network source-scope entities `domain=label.*` (positive/negated/mixed), retaining strict validation of request origins and all non-network policies; sampled differential native/Ghostery corpus 72/72 agreement.
- [ ] Build 183 acceptance: complete seven-phase Ubuntu regression suite at exact commit, expanded real-list corpus, site-scoped manual allow/block checks, and ordinary YouTube preroll/midroll tests with uBlock disabled.
- [ ] Build 184: identify the next measurable network/cosmetic filtering shortfall, retain independent source and no arbitrary list-provided executable scripts; improve YouTube only using observed playback data.

- [x] Build 184: add bounded, privacy-preserving subscription refresh guard to avoid replacing a large working list with a catastrophically smaller candidate; no execution of remote code, rollback only local cached data.
- [ ] Build 184 acceptance: exact-commit full Ubuntu test gate and actual Firefox subscription refresh/304/recovery plus YouTube playback testing.
- [ ] Build 185 adaptive-strategy groundwork: define a finite, reviewed library of dormant site defenses and a deterministic, reversible selector based on coarse local evidence. Never invent scripts or silently bypass failed playback/ad detection.

- [x] Build 185: create locally bounded adaptive YouTube defense selector from existing response-only/combined strategies with tab isolation, playback-failure evidence, manual-mode override and ten-minute rollback.
- [ ] Build 185 acceptance: full local Node/Python suite and real Firefox A/B tests; verify response-only actually improves a confirmed failed playback case.
- [x] Build 186 AI integration: evaluate tiny local model-training project, generate fixed model offline and bundle inspectable JavaScript inference under deterministic safety gates. No cloud AI, runtime Python, external model download or GitHub Actions.

- [x] Build 186: pin and vendor micrograd training sources, ship a static six-feature local model, enforce deterministic tab/safety gates and correct Firefox manifest load ordering; 128 synthetic training states classify as expected.
- [ ] Build 186 acceptance: complete Linux regression suite, real Firefox playback/ads, held-out real-world labeled evidence, model calibration and safety regression before claiming AI benefit.
- [ ] Build 187: build privacy-safe, locally labeled feedback and a replayable offline holdout corpus to measure adaptation against unchanged deterministic mode. No automatic downloads of executable code or model weights.

- [x] Build 187: add privacy-preserving, separately counted YouTube player `ad-showing` observation and show it in standard report, YouTube compatibility export and dashboard. Keep adaptive safety and site isolation. No ad-removal claim.
- [ ] Build 187 acceptance: full exact-commit Linux Node/Python suite, independent Firefox control test with uBO disabled, ordinary video preroll/midroll and ad-supported movie comparison.
- [ ] Build 188: use the new player-state evidence plus response/bridge diagnostics to distinguish ads shown, ads skipped, playback refused and confirmed ad suppression. Prioritize real missing filtering capabilities rather than unsupported parity claims.

- [x] Build 188: correctly classify bundled Ghostery redirect decisions in offline audit as applied vetted local replacements or unsupported redirects, based on the actual production verdict. Verified 13 synthetic audit cases with real bundled Ghostery.
- [ ] Full local seven-phase Node/Python test gate on exact Build 188 tree, plus real Firefox acceptance with uBlock disabled and ordinary YouTube preroll/midroll outcomes documented.
- [ ] Build 189: use corrected audit evidence to prioritize a meaningful missing filter capability; keep source privacy, explicit user decisions and playback protections authoritative.

- [x] Build 189: add privacy-safe YouTube outcome classification. Added bounded outcome classification covering enforcement, playback faults, player ad states, Skip Ad actions and JSON metadata changes without ever claiming confirmed ad-free playback.
- [ ] Build 189 acceptance: full seven-phase Linux suite, real Firefox behavior, privacy and playback regression evidence.

- [x] Build 190: include conservative outcome assessment in YouTube exports. The voluntary TXT/JSON YouTube report now includes explicit evidence category, bounded counts and a false-success disclaimer; the script is bundled locally in the Site Dashboard.
- [ ] Build 190 acceptance: full seven-phase Linux suite, real Firefox behavior, privacy and playback regression evidence.

- [x] Build 192: correct cross-site streaming issue counts.
- [ ] Build 192 gate: run seven-phase Linux tests and controlled Firefox playback/security verification.

- [x] Build 194: prevent malformed clock values in streaming repair permissions.
- [ ] Build 194 acceptance: full Linux tests and supervised real Firefox/privacy/YouTube matrix.

- [x] Build 195: repair streaming permission syntax and track YouTube player replacement.
- [ ] Full suite and live Firefox validations remain unverified.

- [x] Build 197: reject corrupt or oversized filter-list updates.
- [ ] Build 197 full-suite, independent Firefox and competitor parity acceptance remains open.

- [x] Build 198: fix NUL-list validation and sanitize exported engine names.
- [ ] Full seven-phase suite and real Firefox verification remain pending.

- [x] Build 199: compare YouTube report outcomes offline without false success claims.
- [ ] Validate report comparability in matched real Firefox sessions, run full Linux suite.

- [x] Build 200: add a local filtering and release-readiness source audit. Development build target reached.
- [ ] Run complete seven-phase Linux regression on exact Build 200 source, and repair any failures.
- [ ] Check normal YouTube videos, prerolls, midrolls, ads-funded films and streaming in clean Firefox without other blockers; verify ads genuinely removed AND video works.
- [ ] Independent competitor, security, privacy, performance and license audits before owner authorizes public release.

- [x] Build 201: Major four-workstream build: (1) Network Monitor can now block previously allowed traffic using a confirmed, reversible site+hostname+type switch and a lightweight authenticated view of active selective rules, alongside its existing Allow controls; (2) filter-list auto-refresh rejects HTML/XML/JSON error pages and suspicious empty replacement lists; (3) strict popunder grants and claims enforce valid times and reject clock rollback; (4) network capture validates DNS labels/timestamps and whitelists safe explanation labels. Regression coverage includes a full background control interaction. No new permissions, new runtime dependencies or UI geometry changes.
- [ ] Run entire seven-phase Ubuntu suite at Build 201 HEAD and verify Firefox Network Monitor controls, YouTube/Disney+ playback and popup sign-ins before acceptance.

- [x] Build 202: Major integrated YouTube filtering package: the passive observe-only mode no longer exempts first-party JSON calls from native/Ghostery network rules; response-only requires an available Firefox response hook and bridge-only still reaches the MAIN-world filter. The local ad recognizer now hides six explicitly identified YouTube desktop/mobile ad renderer elements while protecting normal video tiles, media players, and existing user exceptions. The ad observer inspects at most 12 insertion nodes without invoking potentially hostile NodeList iterators. Includes real background request-mode integration and DOM safety/performance regression fixtures.
- [ ] Run complete seven-phase Linux tests and controlled clean-profile Firefox comparisons in observe, bridge-only, response-only and combined modes. Verify ordinary video, preroll/midroll, ad-funded movies and Disney+ separately.

- [x] Build 203: Major competitor-source-driven upgrade: explicit user-authored, domain-scoped safe set-constant scriptlet functionality with exception handling and a bundled MAIN runtime; validated current-page Ghostery cosmetic context; bounded popup mutation inspection; new real parser/runtime/DOM/manifest regressions and a public source-code comparison. No remote executable scripts, subscription-provided scriptlets, new permissions, GitHub Actions, user commands or UI geometry changes.
- [ ] Work from [competitor source comparison](COMPETITOR_CODE_AUDIT_2026-11-01.md): safe reviewed scriptlets, expanded redirects, dynamic firewall, syntax parity; full Ubuntu and Firefox video/anti-adblock acceptance.

- [x] Build 204: Guard against apparently plausible-size subscription failures that contain no recognizable filter syntax; reject embedded HTML/XML/JSON error snippets even after valid list headers. Fix manual set-constant scriptlet exceptions consuming the 24-rule runtime budget and conflicting path duplicates. Add targeted regression tests. The existing YouTube interception code and frozen Build 203 tag were not changed.
- [ ] Run Build 204 full seven-phase Ubuntu checks and regression verify actual YouTube ad-free playback before accepting it over the Build 203 baseline.

- [x] Build 205: source-verified fixes for independent audit CF-2 (option-only rules), CF-3 (wildcard/partial hostname anchoring), CF-5 (unsupported cosmetic/snippet classification), and conservative CF-4 aliases. Additional AWS signing guard and tests. No playback behavior edits.
- [ ] Complete diagnostic-only YouTube bridge attribution counters and response-error categorization. Preserve baseline fail-open behavior; do not change player interception or infer which mechanism blocked ads until evidence exists.
- [ ] Reproduce/triage Claude's 9/837 Node failures on Ubuntu; Build 205 addressed only selected source cases, and has not been independently retested with the full suite.
- [ ] Build 206: isolate/benchmark matching performance and compare native/Ghostery/Build 203 verdicts before any index rewrite; plan main-frame and popup protections with safe allow/proceed UX.

- [x] Build 206 (0.3.176): replace hot-path candidate-list copies with ordered streaming rule visits, sparse token deduplication, reusable lowercase URL and safe ASCII literal fast matching. Reference-match regressions are integrated into the local test runner. Observed-working YouTube Build 203 remains frozen.
- [ ] Run complete Ubuntu test runner and record matcher load, p50/p95 request duration and memory with actually enabled EasyList/EasyPrivacy subscriptions; do not infer an improvement from synthetic tests alone.
- [ ] Reconcile Claude's reported nine baseline Node failures and add privacy-safe mechanism attribution for YouTube without touching the working behavior.

- [x] Build 207: record attachment attempts/results and four coarse failure categories from Firefox YouTube response filters, export privacy-safe stats in both local reports, add targeted regression tests, without rewriting responses differently.
- [ ] Instrument page-world JSON.parse/fetch/XHR/bootstrap prune counts separately, with explicit untrusted event semantics and privacy caps, to identify which protection mechanism matters most.
- [ ] Check one reported stream-filter error's stage against user-collected Build 207 report; do not suppress or blindly modify the fail-open response hooks.

- [x] Build 208: safe set-constant waiting for late-created intermediate globals, bounded chain depth and reversible page-value restoration. Add assignment and getter-safety regression tests.
- [ ] Resolve duplicate user-authored scriptlets sharing the *same missing* intermediate path with a shared observer graph if needed; do not claim broad uBO scriptlet parity from this limited feature.
- [ ] Browser-test manual scriptlet enable/disable on intentionally simple test pages before enabling more scriptlet operations, and verify no impact on streaming page bridges.

- [x] Build 209: keep explicit site-scoped cosmetic selectors from being dropped by a 15,000-entry stylesheet cap, preserving site exceptions and legacy small-list ordering. Add synthetic overflow tests registered in Linux suite.
- [ ] Profile actual cosmetic selectors on Firefox across real EasyList/EasyPrivacy/annoyance lists and measure whether stylesheet construction or extension memory needs further changes.

- [x] Build 210: shared prefix tree for multiple site-scoped, user-authored scriptlets with the same late-created intermediate. Keep previous descriptor and site assignment semantics and add 6 regression cases. No YouTube player changes.
- [ ] Test MAIN-world scriptlet prefix changes on dynamic real Firefox test pages, including multiple frames and rapid enable/disable refresh, and verify page-owned setter/accessor protection.

- [x] Build 211: add 16-event bounded, private page-world YouTube prune observations for six existing interception paths, with top-frame validation and separate local export counters. No changes to blocking decisions.
- [ ] Compare Build 211 reports against the saved Build 203 on regular videos, ads-supported films, Shorts and the right-side sponsored rail; note both page-bridge and background rewrite totals, avoiding causal overclaims.
- [ ] Run complete Ubuntu suite and investigate historical nine Node failures from independent review; still no parity claim.

- [x] Build 212: unify strict popup claim freshness and temporary new-tab approval time validation with rollback and expiry checks. Prevent stale claimed navigation cancellation, preserve user-selected one-time opening.
- [ ] Run actual Firefox popup allow/deny tests on selected sources, including about:blank, quick navigation, source-site change, clock adjustment and permitted user-opened tabs, before treating the hardening as accepted.

- [x] Build 213: remove O(1,500) byId scans from every overflow of the bounded 1,500-row Network Monitor, while preserving cumulative counts and privacy-safe snapshot fields. Add two long-session overflow regressions.
- [ ] Measure a high-volume real Firefox capture using local synthetic traffic and compare memory/CPU and exported counts; do not claim measured speedups before the Ubuntu suite and browser checks.

- [x] Build 214: recheck descriptor ownership on same-configuration manual scriptlet refresh, enabling recovery if a page redefines a hooked property without calling its setter. Add 3 regression cases and keep page-owned replacement values on disable.
- [ ] Real Firefox SPA simulations: alternate direct assignment, `Object.defineProperty`, site-owned getter changes, and user enable/disable. Confirm no interference with normal YouTube page bridge under active default settings.

- [x] Build 215: default-on, locally cached phishing threat database with publisher-attributed listings, daily refresh, last-good retention, exact-host allow overrides, and visibly separate settings/status from ad filters. A threat listing is not a verified identity judgment.
- [ ] Build 216: full, opt-in domain investigation card including RDAP entity/public registration details, authoritative DNS evidence and hosting ASN where safely retrievable; make empty/unverified fields explicit and export the source/timestamps.
- [ ] Expand threats only after source licensing and false-positive review, with independent categories for malware distribution, phishing, deceptive redirects and command-and-control, never simply treating an unknown hostname or TLD as malicious.
- [ ] Add user-friendly blocked-navigation page with clear publisher evidence, source date and explicit per-domain proceed override; avoid full URLs in remote queries.

- [x] Build 216: on-demand investigation of recorded blocked hostnames with detailed public domain RDAP records, Firefox DNS, sampled public IP-network RDAP, local phishing-list status, source caveats and optional TXT/JSON export. No background cloud reputation calls tied to browsing.
- [x] Build 217: packaged blocked-site interstitial with publisher/date evidence, tab-bound short-lived nonce, explicit checked exact-host exception, safe homepage navigation, and separate subresource cancellation. Full Firefox acceptance pending.
- [ ] Expand verified categories only after feed/licensing review, and display multiple independent detections without mistaking mirrored feeds for independent sources.

- [x] Build 217 (0.3.187): local phishing warning page and exact-host proceed option. Extension page contains no blocked URL, uses a cryptographic tab-bound three-minute token, labels list claims as evidence rather than confirmed identity, saves opt-in overrides only on explicit acknowledgement, and keeps unrelated ad/tracker filtering unchanged.
- [ ] Build 217 acceptance: complete seven-phase Ubuntu Node/Python suite, Firefox main-frame redirect and new-tab tests, persistence-error rollback, private browsing checks, false-positive UX, and phishing-list update/revocation verification. No release approval.
- [x] Build 218 (0.3.188): introduce a strictly local YouTube A/B diagnostic lab for two voluntary JSON exports. Whitelist existing fixed schema/modes, strip hostnames and private URLs, compare page/response and playback counters, show experiment mismatch caveats, accept optional user-observed ads/playback and export sanitized comparison only when clicked. Keep the Build 203 playback behavior unchanged.
- [ ] Build 218 acceptance: full seven-phase Linux Node/Python suite, static/test-fixture privacy and regression review, real Firefox UI file import/export, no-upload verification, and controlled matched A/B YouTube ordinary/preroll/midroll/ads-funded movie/Shorts testing with other blockers disabled.
- [x] Build 219 (0.3.189, AMO source-readiness slice): honor the owner's new November 6 submission target and observed-working YouTube/Disney+/1337x/Pirate Bay baseline; create a strict/no-network AMO source/locking/license gate with negative tests; refuse unsigned packaging until a real lockfile and source review assets are present; package root owner LICENSE and upstream MPL licenses; draft reviewer notes, source reproduction instructions, listing metadata, and dated release-week matrix. No new branch, Actions, extension package or browser-facing filtering changes.
- [ ] Build 219 release acceptance: generate and commit valid npm lockfile via official registry, independently rebuild and compare Ghostery bundled byte content, complete current seven-phase Ubuntu Node/Python suite, source security/license audit and full real Firefox compatibility matrix. Do not claim Mozilla approval or parity from synthetic checks.
- [ ] Build 220: resolve actual local test failures and reproducible candidate/source packaging; address real Firefox regression evidence only; prepare owner-approved tag and AMO submission with exact accepted version, privacy disclosures, reviewer notes and public listing assets. Mozilla review timing remains outside our control.

- [x] Build 220 (0.3.190): fix permitted-request report evidence gaps. Capture explicit allow-path decisions for completed requests, keep up to 400 recent individual events and 150 aggregates with HTTP method/status, time, and exception/pause/engine reason breakdown; surface them in existing inspector and TXT/JSON. No sensitive paths or headers captured; no changes to blocking verdicts.
- [ ] Build 220 acceptance: run complete current Linux Node/Python suite; verify an actual ChatGPT tab with protection on and allowlisted, another website with an exception and one ordinary engine-permitted request; test method/status/allow decisions against Firefox Network Monitor, normal reload, privacy on/off, dashboard single-group exports and no credentials/tokens in exports. This is needed before Firefox Add-ons submission.

- [x] Build 221 (0.3.191): add independent read-only Ghostery rebuild and byte compare with checked-in bundle, require valid official-registry/SHA512 npm package-lock entries, enforce vendor parity at unsigned Firefox candidate packaging, and register negative/mismatch tests. Repair README escaped newlines and release preflight's true license phrase. No filtering/UI changes.
- [ ] Build 221 acceptance: obtain a **real** npm-generated `package-lock.json` from the official registry without fabrication; run `npm ci` and `npm run verify:ghostery` on the exact accepted checkout; resolve any genuine byte mismatch; run the full seven-phase Linux suite and clean Firefox video/popunder/privacy matrix. User approval is mandatory before tagging or submitting to AMO. No Actions.

- [x] Build 222 (0.3.192): targeted fallback filter for a separately hosted media preroll observed allowed in owner Firefox testing; add scope/type/normal-CDN/exception regression tests and record actual failure without claiming working status.
- [ ] Build 222 acceptance: updated Firefox 0.3.192 real-video reload, confirm preroll removed AND normal video plays, verify all report reasons and source version, re-run entire Linux suite. Do not claim the original 0-block result was caused by a global failure or a site allowlist.

- [x] Build 223 (0.3.193): narrowly scoped original-tab advertising takeover guard added for a reported video-site window case, with targeted tab/provenance/navigation regression tests. Browser acceptance and broader popup protection are still pending.
- [x] Build 224 (0.3.194): official repository link in the existing popup footer and Settings Help, homepage metadata for Firefox, secure-link release gate and negative fixtures. Refresh stale release status text without changing blocking, UI control positions or permissions.
- [ ] Build 224 acceptance: run all seven Linux regression phases, confirm popup/settings links open the right repo in Firefox without disturbing video playback or unwanted-popup protection, and review the AMO metadata. Reproducible npm dependency lock, exact vendor byte comparison, owner approval, and Mozilla signing remain blocked/open.

- [x] Build 225 (0.3.195): repair omitted original-tab takeover tests in the Linux runner; strengthen the guard to require observed two-tab takeover evidence rather than the source origin alone; add structural safety regression and record the owner's Disney+ CSI: Las Vegas OFF/ON test in docs.
- [ ] Build 225 acceptance: run the seven-phase Linux suite to completion, recheck legitimate same-tab navigation and actual popunder takeover in Firefox, verify exact-version Disney+ ad suppression and player usability. Generate genuine npm lockfile from official registry, reproduce bundled Ghostery bytes, finish third-party/license/privacy audit, and obtain explicit owner approval before a candidate/signing submission.

- [x] Build 226 (0.3.196): activate owner-approved `https://www.patreon.com/c/dkliveblock` Patreon page through existing toolbar/Settings buttons, add tests for safe click-only opening and invalid/missing URLs, and link optional support from the GitHub README.
- [ ] Build 226 acceptance: click Patreon in both Firefox toolbar and Settings, verify exactly one new official tab per deliberate click, no automatic external access or paid gates, and full extension behavior unchanged; full Linux suite and release dependency verification remain outstanding.

- [x] Build 227 (0.3.197): fix right-click element picker persisting silently without hiding the element, add reversible dedicated cosmetic stylesheet (independent of large-list CSS budget), validate saved selectors and provide failed-save feedback. Add site-scoped CBS News article autoplay suppression requiring actual player input. Record the owner's CBS observations only in docs.
- [ ] Build 227 acceptance: owner Firefox tests selected-element hide/reload/Undo/paused website and CBS news sidebar no-autoplay, manual Play, scrolling/clicking elsewhere, video frames; ensure YouTube/Disney+ ad-suppression and Patreon are unchanged. Full Linux seven-phase regression and release provenance gates still required.

- [x] Build 228 (0.3.198): make new right-click picker hides temporary per document; refresh restores them. Keep popup Undo for page-only picks and older saved rules. CBS news article protection releases all media interference after an actual player/control interaction to avoid spinner, while leaving network filters untouched. Focused test coverage added.
- [ ] Firefox acceptance for Build 228: first undo any CBS legacy saved picker hides (popup Undo hide), reload page, confirm video stays paused, click Play and see whether footage loads normally. Verify CBS ads remain absent; hide a harmless element, refresh and confirm it returns. Confirm YouTube and Disney+ unchanged.

- [x] Build 229 / 0.3.199: clear CBS's legacy permanently saved picker CSS, remove picker persistence actions, preserve CBS video config endpoint only for top-level CBS News and only script/XHR, protect known video containers from automatic cosmetic hiding, publish informational GitHub Pages in root/docs.
- [ ] Owner Firefox verification: CBS News homepage right-side video should be visible and manually playable; CBS article video should wait for Play and start without infinite spinner. Confirm CBS ads remain blocked. Test Block Element hide and refresh to restore; retest YouTube and Disney+.
- [ ] Verify GitHub Pages live address and configured Pages publishing source, add actual public Google Drive file link after a tested release is available.
