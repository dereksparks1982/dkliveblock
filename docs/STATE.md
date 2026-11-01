# DK Live Block: current engineering state

**Source snapshot: Build 214 / 0.3.184 (2026-11-01), unreleased. Build 203 remains the user-observed-working YouTube baseline.**
This document describes verified repository state and missing acceptance evidence; it is not a parity claim.

## Implemented source
- Firefox MV2 extension with bundled Ghostery 2.20.3 plus native filtering, filter-list subscriptions, content hiding, user/site exceptions, popup defenses, network inspection and locally exported blocked/allowed request summaries.
- Site-level cosmetic exceptions now govern supplementary Ghostery CSS (Build 159) and automatic DOM ad-slot recognition (Build 160).
- Build 161 corrected three identified test fixtures. Build 162 adds bounded synthetic native/Ghostery/hybrid verdict comparison, and registers the previously omitted runner self-test. No production blocking rule changes.

## Outstanding evidence / known risks
- **Offline suite**: complete current Build 200 Node/Python suite has not been executed and accepted. The historical complete pass belonged to Build 63. The independent Build 158 review found 690/693 Node cases passed and three fixtures failed.
- **Engine correctness**: Build 163 now consults Ghostery exceptions before enforcing ordinary native subscription blocks. Other precedence, unsupported syntax, important rules and real-browser compatibility remain unverified.
- **YouTube**: Build 167 records coarse first-load bootstrap observations. Build 168 adds a temporary YouTube test switchboard that separates response filtering, page-bridge filtering and observe-only diagnostics, without changing the default combined behavior. Existing first-party JSON transformations, page bridge and Skip Ad assistant have not passed real Firefox anti-adblock, preroll, midroll, ad-supported film and ordinary-video playback acceptance. No evidence of reliable ad-free playback is claimed.
- **Security and distribution**: complete permissions/privacy and Linux native-companion audit, long-session performance measurements, Mozilla signing and owner-approved release remain open.

## Next milestones and gates
1. Run **all seven offline phases** at exact Build 188 HEAD, resolve any remaining failures, record evidence.
2. Build 162 differential observatory implemented; full Ubuntu execution remains pending.
3. Build 163: exception-rescue and manual precedence changes landed; additional differential/browser verification needed.
4. Instrument and test YouTube with a clean, controlled Firefox matrix, then implement fixes supported by observed results.
5. Security, performance, competitor benchmarks, final acceptance and Mozilla review.

No GitHub Actions, hosted CI, automatic deployments, external filtering engine installations or public download packages are authorized.

## Build 169 blocked-event controls
The current Site Dashboard now exposes confirmed, reversible remembered site + destination-hostname + request-type Allow switches for retained blocked requests. These are **not individual URL controls**. Popup restrictions and manual selective blocks remain separate. Live Firefox, YouTube and full local test acceptance remain outstanding.

## Build 170 unified YouTube observation export
The ordinary blocked-request TXT/JSON now includes coarse response/body counts, configured temporary experiment mode and at most four first-load bootstrap observations when the selected site is YouTube. This is a user-triggered local report, not a change to response interception. An empty playback-health list does not mean ads were removed. Regular-video anti-adblock behavior still needs controlled Firefox comparison with the movie-playback baseline.

## Build 171 packaged source audit
A new offline source asset-closure checker has been validated against the GitHub tree: 87 referenced packaged assets, 10 HTML pages, zero missing. A regression test is registered as Node test file #117. Full seven-phase Linux suite and live Firefox acceptance still remain unverified.

## Build 172 filter compatibility
Added explicit-site literal-only :matches-attr procedural cosmetics, including precise exception matching. Arbitrary regex attribute matching, scriptlets and HTML response filtering remain unsupported. Targeted JavaScript source smoke passed, but the full suite and live browser validation remain pending.

## Build 173 report accuracy
Current exact host/type Allow/Block choices appear beside historical blocked events in locally exported TXT/JSON reports. This is a reporting improvement only; prior observations remain historic, and full browser/Node/Python acceptance remains open.

## Build 174 request authorization and settings safety
Foreign URL-bearing no-tab messages no longer enter the privileged message flow. All rejecting subscription and website-exception validators run before settings mutations. Regression coverage now includes persistence failure rollback for a remembered blocked-event Allow choice. The full Linux test suite, Firefox behavior and broader permission audit remain unverified.

## Build 175 native engine candidate performance
Native request matching reuses one hostname parse and skips token scanning when there are no token-indexed rules. Synthetic candidate equivalence checked; no real-browser timing claim. The standalone benchmark now reports hostname parse counts. Full Linux suite and Firefox baseline still pending.

## Build 176 YouTube late bootstrap and SPA recheck
Main-world response bridge in active modes revisits late first-load and SPA navigation bootstrap player ad metadata at 1s and 3s (without modifying observe-only mode). Optional boolean `playerMetadataCleaned` in private exports indicates a late cleanup actually occurred; this alone does not establish video ads were removed. Normal-video playback still requires Firefox confirmation and full regression remains open.

## Build 177 competitor-source-informed YouTube interception
Reviewed uBlock Origin's separate scriptlet JSON-prune/host-exception architecture without copying GPL source. DK's independently written first-party page bridge can now intercept eligible JSON.parse player data and remove its previously recognized ad metadata, in addition to fetch/XHR/bootstrap paths. This is a bounded new capability, **not** a proven fix for regular YouTube ads. Complete Linux suite and actual playback remain unverified; no release.

## Build 178 Ghostery local redirect adapter
The hybrid engine now honors only two vetted Ghostery network redirect outputs through DK's already bundled local inert resource adapter. Confirmed on native-unsupported Ghostery entity-domain fixtures in an isolated V8 harness. No remote script evaluation or raw vendor data URL execution. Actual Firefox ad blocking and complete Node/Python suite remain pending; no parity claim.

## Build 179: safe style cosmetic syntax
The native cosmetic parser now recognizes only the domain-scoped display-none-important subset of `:style()` with ordinary site exceptions. The local syntax inventory differentiates this supported subset from other unsupported extended cosmetics. The bundled YouTube compatibility list has 19 previously accepted ordinary cosmetic rules; no new YouTube ad-blocking result is implied. Full Linux suite and live Firefox test remain pending.

## Build 180 YouTube assignment-time bridge
The active main-world bridge now attempts a reversible, fail-open data-property interceptor for future `ytInitialPlayerResponse` assignments. Observe-only and disable remain non-mutating. Isolated V8 checks passed; real Firefox ad performance, anti-adblock effects and the complete Ubuntu suite remain unverified. No parity or release claim.

## Build 181 Ghostery important exception precedence
Native ordinary subscription exceptions no longer automatically override a stronger `$important` rule recognized only by the embedded Ghostery parser. Manual decisions and document-level policy remain authoritative. Verified in synthetic actual-vendor harness; full Linux suite and real browser acceptance remain unverified. No public parity claim.

## Build 182 literal computed-style cosmetics
The native procedural engine now accepts only a vetted literal `:matches-css()` subset, using bounded read-only computed-style predicates and the existing reversible hide path. More complex regular expressions and arbitrary styling remain unsupported. Isolated V8 tests passed; full Ubuntu suite, live Firefox performance and YouTube ad removal remain unverified.

## Build 183 native source-entity network scopes
The native parser now accepts a deliberately restricted `domain=entity.*`/negated entity scope subset for subscription and manual network rules. Explicit browser-origin and destination validation remains strict. The updated matcher agreed with bundled Ghostery for 72 sampled synthetic decisions. Real filter lists, full Ubuntu suite and live Firefox YouTube testing are still unverified; no parity or release claim.

## Build 184 guarded list refresh groundwork for automatic defense
Built-in/custom filter subscription updates now retain a substantial cached list if a candidate loses more than 75% of actionable rules; local error and scheduled retry occur, no telemetry or remote code. Future adaptive strategy switching should select among pretested, reversible defenses from coarse local evidence, not assert that ad delivery methods are finite or update-free. The full Linux suite and Firefox ad-removal tests remain pending.

## Build 185 first dormant adaptive YouTube strategy
Bounded in-memory classifier-free safety controller selects existing response-only strategy after two spaced playback failures correlated to nearby blocked media, returns to combined after ten minutes, and defers to manual test modes. No AI model or cloud inference bundled yet. Live playback acceptance and full Ubuntu suite are outstanding.

## Build 186 micrograd-trained local decision layer
Added training-time vendored karpathy/micrograd (MIT), seeded synthetic training, and a static JavaScript classifier that can only veto or recommend the controller's existing response-only fallback under strict safety gates. Included enforcement/ad-skip negative evidence. Fixed Build 185's missing adaptive-youtube.js background loader entry. Synthetic training 128/128 classification passed, NOT real-world ad detection or performance. No cloud/telemetry/runtime Python; full Linux and Firefox tests remain pending.

## Build 187 ad-state observability
Two supplied YouTube reports recorded 13 and 20 blocks (10 and 12 first-party YouTube XHR blocks), with no playback diagnostics. A new bounded, locally reported `ad-showing` observation detects transitions in YouTube's own ad-state class and distinguishes those observations from blocked requests and Skip Ad clicks in exports and the Site Dashboard. It cannot trigger new filtering actions or adaptive bypasses. Targeted tests passed, but the complete Linux suite and real Firefox YouTube ad-removal checks are still pending.

## Build 188 parity-audit redirect classification
The offline hybrid/native/Ghostery audit now recognizes vetted packaged inert redirects actually selected by DK instead of incorrectly calling all Ghostery redirect decisions unsupported. Thirteen synthetic fixtures pass on the real bundled engine. Production blocking is unchanged and full Ubuntu suite/Firefox ad verification remain pending.

## Build 189: add privacy-safe YouTube outcome classification
Added bounded outcome classification covering enforcement, playback faults, player ad states, Skip Ad actions and JSON metadata changes without ever claiming confirmed ad-free playback. Full Ubuntu test suite and live Firefox/YouTube acceptance remain unverified.

## Build 190: include conservative outcome assessment in YouTube exports
The voluntary TXT/JSON YouTube report now includes explicit evidence category, bounded counts and a false-success disclaimer; the script is bundled locally in the Site Dashboard. Full Ubuntu test suite and live Firefox/YouTube acceptance remain unverified.

## Build 192: correct cross-site streaming issue counts
The toolbar's streaming issue count now includes only records for the currently selected streaming hostname, instead of mixing history belonging to a different site previously visited in the same tab. The full Linux regression suite and live Firefox acceptance are unverified.

## Build 194: prevent malformed clock values in streaming repair permissions
Explicit ten-minute streaming recovery exceptions now reject invalid/overflowing clocks, fail closed when expiration cannot be evaluated, and preserve exact tab, source-host, request-host and request-type scope. Full Ubuntu suite and real Firefox playback remain unverified.

## Build 195: repair streaming permission syntax and track YouTube player replacement
Corrected a Build 194 revoke() syntax error and test alias, and made YouTube's ad-state probe reset its observed-player identity when SPA navigation replaces the video element, retaining the eight-second deduplication cooldown. Full Linux regression suite and real Firefox acceptance remain outstanding.

## Build 197: reject corrupt or oversized filter-list updates
The built-in subscription refresh guard now rejects NUL-bearing lists, oversized replacements and candidates exceeding its bounded line budget before considering the list-shrink threshold; existing working cached lists remain authoritative. Full seven-phase Linux runner and real Firefox playback remain unverified.

## Build 198: fix NUL-list validation and sanitize exported engine names
The list-refresh guard now rejects actual NUL bytes, not the escaped text sequence; corrected Build 197 fixture newline escapes. The YouTube export limits filterBackend to the known native/hybrid labels, eliminating another untrusted output field. Focused actual module assertions passed. Full Ubuntu suite and live Firefox acceptance remain unverified.

## Build 199: compare YouTube report outcomes offline without false success claims
Added side-by-side categorical comparison of two locally exported YouTube compatibility reports. Comparison displays only experiment modes and deltas for player ad-state observations, playback faults and modified JSON responses. It neither uploads evidence nor declares either mode ad-free. A bounded optional offline developer CLI is included. Full Ubuntu suite and real Firefox acceptance unverified.

## Build 200: add a local filtering and release-readiness source audit
A read-only local candidate audit now runs the actual bundled native/Ghostery hybrid differential decisions, inventories packaged filter syntax and explicitly marks Firefox, ad-free video, full Linux regression, competitor parity and public release as unverified. Integrated into the existing seven-phase Linux runner with permanent regression tests.
**Outstanding:** full current Ubuntu suite and live Firefox/YouTube verification.

## Build 201: four-system upgrade
Major four-workstream build: (1) Network Monitor can now block previously allowed traffic using a confirmed, reversible site+hostname+type switch and a lightweight authenticated view of active selective rules, alongside its existing Allow controls; (2) filter-list auto-refresh rejects HTML/XML/JSON error pages and suspicious empty replacement lists; (3) strict popunder grants and claims enforce valid times and reject clock rollback; (4) network capture validates DNS labels/timestamps and whitelists safe explanation labels. Regression coverage includes a full background control interaction. No new permissions, new runtime dependencies or UI geometry changes.
Full Ubuntu suite and live Firefox video/controls acceptance remain unverified.

## Build 202
Major integrated YouTube filtering package: the passive observe-only mode no longer exempts first-party JSON calls from native/Ghostery network rules; response-only requires an available Firefox response hook and bridge-only still reaches the MAIN-world filter. The local ad recognizer now hides six explicitly identified YouTube desktop/mobile ad renderer elements while protecting normal video tiles, media players, and existing user exceptions. The ad observer inspects at most 12 insertion nodes without invoking potentially hostile NodeList iterators. Includes real background request-mode integration and DOM safety/performance regression fixtures.
Full Ubuntu suite and live Firefox ad-free video compatibility remain unverified.

## Build 203
Major competitor-source-driven upgrade: explicit user-authored, domain-scoped safe set-constant scriptlet functionality with exception handling and a bundled MAIN runtime; validated current-page Ghostery cosmetic context; bounded popup mutation inspection; new real parser/runtime/DOM/manifest regressions and a public source-code comparison. No remote executable scripts, subscription-provided scriptlets, new permissions, GitHub Actions, user commands or UI geometry changes.
Full Ubuntu and live Firefox tests still pending.

## Build 204: network-list retention and scriptlet precedence (unreleased)

- `0.3.174` protects working filter subscription caches from same-size error text masquerading as rule lists, with conservative syntax evidence and embedded response-markup checks. Small existing and initial custom lists remain allowed.
- User-authored set-constant scriptlets now resolve exceptions before the 24-rule runtime cap and avoid multiple live values for one property path.
- No change to `src/youtube-*.js`, player/network response interception, existing UI geometry, permissions, bundled vendor, or approved frozen Build 203 snapshot/tag. Full Linux and live Firefox verification remain pending.

## Build 205: independent-audit parser corrections (unreleased)

- Responds to confirmed Claude audit CF-2 (option-only `$script` / `$popup` / `$removeparam`), CF-3 (wildcard/prefix hostname indexing), CF-5 (HTML/snippet markup misclassified as supported network rules), and four conservative aliases from CF-4 (`doc`, `ghide`, `ehide`, `popunder`).
- Native `cleanNavigation` now protects `X-Amz-Algorithm` alongside other AWS signed-query fields; this addresses the test discrepancy noted under CF-11. Script/filter coverage reporting distinguishes additional unsupported `#@^#`, `#@%#`, `#$?#` forms.
- No changes to YouTube bridge, response handling, streaming playback, bundled Ghostery, permissions, new-tab logic or UI geometry. Full Ubuntu seven-phase and real Firefox acceptance are not yet verified; the preserved Build 203 tag remains the fallback.
- Independent audit recommended instrumenting the YouTube bridge and investigating all nine reported Node test failures; **this work remains pending**, not claimed complete by Build 205.

## Build 206: parity-gated native matcher optimization (unreleased)

- Retains the externally available `candidates()` sequence but stops allocating combined candidate arrays during `checkRequest()`: ordered `visitCandidates()` traverses generic, host suffix, and indexed token buckets, preserving last-matched-block, exception, and important priority.
- Only matched 4-character URL tokens enter the duplicate-token set, reducing allocations on URLs without matching token buckets. Host suffixes are traversed without building and joining a domain-parts array. The pre-lowercased URL is reused for token selection and safe literal-string checks.
- ASCII-only unanchored literal rules use substring matching rather than regex; Unicode URLs and regex/wildcard/anchored rules retain original regex behavior.
- Permanent regression test compares old array-based candidate scan and blocking verdicts on 2,280 synthetic request-policy combinations, plus Unicode and rule-reload behavior. Included in Linux offline test suite, but full seven-phase suite and live browser acceptance remain pending.
- No YouTube filtering/bridge/response modifications, other extension permissions or UI geometry changes. Build 203 tag remains frozen.

## Build 207: YouTube diagnostic counters (unreleased)

- Fixed, privacy-sanitized per-tab `attachAttempts`, `attached`, and `errorStages.{attach,data,stop,stream}` counters; exposed in both local TXT/JSON report paths.
- Native and page-world playback protection remains unchanged; observational stage counts cannot identify every ad blocking mechanism (MAIN-world JSON.parse is still not instrumented).
- Isolated V8 stage tests and a YouTube report privacy test passed. Ubuntu Node suite and browser playback remain pending; Build 203 tagged source still the tested reference.

## Build 208: delayed user-authored scriptlets (unreleased)

- MAIN-world set-constant runtime may await a missing intermediate page object and attach an existing, validated one- to three-segment property shim when the page assigns that intermediate later.
- On replacement of a watched intermediate, earlier child traps are restored first. Page-assigned property values survive disabling. This is limited to a user-authored, domain-scoped rule, not remote subscription code.
- Five additional tests passed alongside five existing tests in a focused synthetic runtime. Simultaneous shims sharing a not-yet-created intermediate may remain limited; complete Firefox/Ubuntu and compatibility testing are pending.
- No YouTube-specific bridge changes; tagged Build 203 backup stays untouched.

## Build 209: site-specific CSS rules survive huge filter-list caps (unreleased)

- When cosmetic hiding exceeds the existing 15,000-selector ceiling, explicit site-specific selectors are placed first, before generic selectors. Other pages keep previous order. All matches, site-specific exceptions and page-level cosmetic protections still apply before prioritization.
- The getStyle path passes its current ceiling to `FilterEngine.getSelectors`; it retains auth/video safe-selector checks and existing final CSS cap. The function's original two-argument behavior remains unchanged.
- Four targeted tests passed, including 15,003 synthetic generic selectors and a site-scoped exception. Full Linux tests and live Firefox still required; Build 203 remains preserved.

## Build 210: shared prefix watcher for manual set-constant rules (unreleased)

- Replaced per-rule independent intermediate traps with a shared bounded property-prefix tree: several explicit user-authored rules can target distinct leaves under the same initially missing page object. Intermediate assignment rebinds all children, restoring previous children first.
- Identical settings refresh no longer tears down/reinstalls a constant property, preserving page assignments and avoiding brief resets. Getter-backed/inherited property paths remain off limits, and nonwritable intermediates are only traversed without property replacement.
- Fixed literal selection, 24-rule/three-segment depth bounds, no arbitrary eval or remote scripts and no added WebExtension privileges. MAIN-world event delivery is still a page-forgeable control channel, **not an authenticated extension command**.
- Targeted source checks: 16/16 runtime tests passed in an isolated V8 harness; complete Node/Firefox acceptance pending. Build 203 preserved.

## Build 211: source-attributed YouTube page prune samples (unreleased)

- Existing YouTube page bridge now reports bounded, fixed-kind page-prune observations: `bootstrap`, `json-parse`, `fetch-json`, `fetch-text`, `xhr-json`, `xhr-text`. No video URL, ID, media bytes, request body or arbitrary page text crosses this reporting path.
- The isolated content controller accepts at most 16 page events; background checks host, top frame, request-log consent and active protection before saving capped tab counts. Outputs appear in YouTube and combined blocked-request exports with explicit untrusted-source caveats.
- Data can be forged by the webpage and may miss prunes after the cap. It does not establish ad-free playback or become evidence for adaptive changes. Background response-filter stats remain separate.
- Two direct page-bridge tests and two note/report tests passed in limited V8 smoke checks; full offline tests and live Firefox remain pending. The original Build 203 backup and tag are untouched.

## Build 212: strict popup claim and approval clock hardening (unreleased)

- Centralized validation of strict popup tab-claim freshness, requiring nonnegative elapsed time and rejecting future/invalid timestamps before cancelling newly opened tabs. Previous direct `Date.now()-claim.when<=CLAIM_MS` could treat a future claim as active after clock rollback.
- Explicitly approved new tabs now use bounded `since`/`until` records to ensure a rollback cannot silently prolong an allow decision; invalid entries are dropped. Popup permit status follows consumption's established time window.
- Still limited to high-risk opted-in strict sites. No extra host coverage, runtime dependencies, UI changes, YouTube code edits, or GitHub Actions. 9 focused unit tests passed. Full Linux/browser acceptance pending.

## Build 213: bounded network monitor without linear ID-map evictions (unreleased)

- The opt-in per-tab Network Monitor retains historical cumulative status totals while keeping only the 1,500 most recent rows. Each internal row now associates its request ID via a private Symbol property, letting both ordinary and synthetic-popup overflow evict the old request mapping in constant time rather than iterating the Map.
- Exported rows remain explicitly projected from safe hostname/type/status/time fields, so no raw ID, URL path, query, cookie or response payload is added. Site-scoped controls and allowed/blocked toggles are unchanged.
- Eight focused V8 tests passed, including two overflow regressions with deliberately iteration-disabled ID maps; full Ubuntu browser and performance measurement remain pending.

## Build 214: idempotent but self-repairing manual scriptlets (unreleased)

- User-authored fixed constant shims now verify descriptor ownership on a repeated same-settings refresh. If a page replaced an intercepted own property descriptor, the runtime restores any abandoned child shims before reattempting installation, without clobbering the page-owned replacement on later disable.
- The shared-prefix structure from Build 210, three-component path cap, protected-global allowlist and no-eval requirement remain. Accessor-backed paths are never read. Page-forgeable DOM events remain untrusted with no extension privileges.
- Nineteen focused runtime tests passed in an isolated V8 harness, including three new descriptor-overwrite scenarios. Full Ubuntu test suite and real Firefox reliability tests remain pending.
