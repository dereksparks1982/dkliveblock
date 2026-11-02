# Current build: 268 / v0.3.238 (November 2, 2026)
Orion experimental iOS/Mac package includes a bounded exact-site Pause/Resume control and local host-only exceptions, restoring hidden content on pause. Unsupported storage uses a page-only setting; failed reads leave protection paused. Firefox UI/permissions unchanged and GraphQL filter OFF. New source checks registered; full Linux suite and real Orion iPhone tests pending.


- Corrected an event-batch short circuit in the Orion DOM experiment so it processes up to 40 Meta mutation records, including ephemeral Sponsored labels removed later in the same batch.
- Strengthened Orion page-cache and iPhone foreground lifecycle: canceled callbacks from old generations cannot run in a reopened page, and visibility return schedules one rescan.
- Aligned Firefox's own bounded observer to inspect every record in its 40-event window instead of stopping when both alert types are first seen.
- Ran 11 isolated JS lifecycle regression scenarios. Full Linux suite and real Orion iPhone / Firefox Facebook tests remain outstanding.
- Facebook GraphQL response rewriting remains OFF by default. Not a verified ad-removal PASS.


- Added three **real event-driven, bounded** Agent Nesty Meta detectors on top of existing Facebook recognition. These are not neural-network predictions.
- Corrected 29 missing Node test registrations and registered the eleventh-case Build 266 fixture; the full Ubuntu suite has not been executed.
- Orion remains experimental DOM-only, and its network interception remains unverified.
- Facebook GraphQL interception remains OFF by default until confirmed live and false-positive-safe.

# Current build: 265 / v0.3.235 (November 2, 2026)

- **Unreleased GitHub source:** manifest and package version 0.3.235. No complete local Ubuntu regression or real Firefox Meta acceptance has been recorded.
- Facebook DOM scanning gained right-rail accessibility-label detection (including short Sponsored aria names on buttons) while preserving geometry boundaries and Contacts protection.
- The separate Meta GraphQL/JSONL response module now fails open for *entire* mixed responses if any record is malformed, unknown transport text, or an error object. Nested `__bbox` errors are skipped. Stream memory, idle and total lifetime are now bounded.
- `metaGraphqlFilter` stays **OFF by default** pending live compatibility verification. Do not present GraphQL filtering as verified or enable it automatically.
- **34/34 targeted isolated JS checks passed** across Builds 263–265. The full `scripts/test-local.sh` suite and YouTube Build 203 A/B are still outstanding.
- Website layout remains unchanged: two six-card educational grids, local credited Pixabay click effect, black × in cyan 44px close button, conditional Back to top. Root/docs site HTML synchronized.
- See [Build 265 notes](BUILD_265.md) and [current handoff](CONTINUATION_HANDOFF.md); older sections below are historical snapshots.

# Current implementation snapshot: Build 264 / v0.3.234 (Nov 2, 2026)

- Current extension manifest/package version **0.3.234**, unreleased and not fully Firefox-verified.
- Facebook DOM detector now recognizes bounded character-split Sponsored labels in the right rail, alongside previous feed, mobile, Marketplace and protected Contacts logic.
- Meta GraphQL module now supports specifically identified ad entries in news feed, Marketplace stories, Marketplace feed units, search results and limited `require`/`__bbox` JSONL envelopes. Other data, reactions, messages and unknown record shapes fail open.
- **Meta GraphQL rewriting remains opt-in/OFF by default** due to known risks of broken Facebook interactions from response-modifying ad blockers.
- 20 isolated synthetic JavaScript tests passed across Build 263 and Build 264 on the current source. Full Ubuntu suite, live Firefox visual test, real Facebook schema evidence and YouTube A/B still pending.
- Public website retains the owner's two sets of six dark equal-height education cards, local credited Pixabay button sound, black × inside cyan Close buttons, and conditional Back to top. Root/docs website copies are identical.
- [Handoff](CONTINUATION_HANDOFF.md) and [Build 264 notes](BUILD_264.md) contain next verification goals. Older snapshots below are dated historical records, not accepted current release evidence.

# Latest source snapshot / post-Build 263 website changes

- **Source extension version:** 0.3.233 in `src/manifest.json` and `package.json`. GraphQL filtering is opt-in/off by default and unverified in live Firefox.
- **Website:** two sets of six matching, dark, clickable information/learning cards. Twelve dialogs. Top Close has been simplified to a cyan × (44px touch target). A bottom Back to top button appears only on panels that need scrolling.
- **Audio:** `assets/sound/dragon-studio-button-press-382713.mp3` by DRAGON-STUDIO, locally played on website button/card clicks. Credited under Pixabay Content License in `docs/ATTRIBUTIONS.md`.
- **Website source:** root `index.html` and `docs/index.html`, kept byte-for-byte identical.
- **Deployment:** GitHub-managed Pages deployment has previously passed. This change still needs its own Pages publishing and a real browser test.
- **Outstanding risks:** Claude's reported historical security-contract/full test failures, incomplete live Meta ad acceptance, graph response schema verification, YouTube baseline A/B and engine performance. See `docs/CONTINUATION_HANDOFF.md`. The dated material below is historical, not a current release declaration.

# DK Live Block: current engineering state

**Latest repository source: Build 240 / 0.3.210 (November 1, 2026), unreleased. Build 203 remains the tagged owner-observed-working YouTube baseline.**
Historical build sections below remain dated snapshots; this document distinguishes source implementation from browser acceptance and does not claim competitor parity.

## Build 240 / 0.3.210 CSS correction (unreleased)
- Owner screenshot: request-row Block toggles in Site Dashboard stretched horizontally. Root cause: old row CSS flex:1 affecting nested slider spans. Scoped 48px track override and fixed-action caption now included, without modifying any request permissions or stored rules.
- Firefox on-screen check still required; same known-good ad blocking and browser compatibility milestones as Build 239.

## Build 239 / 0.3.209 snapshot (unreleased)
- Source work: draggable private Ad Investigator now includes bounded DOM ancestry and cosmetic matches plus existing network, rule detail and cosmetic-debug entry points. Owner only. No automatic block from AI scores.
- Source work: opt-in network capture shows grouped third-party destinations and uses existing scoped, reversible Allow/Block request controls displayed as cyan/dark switches. The main toolbar brand is DK icon + LIVE BLOCK with functional black/white/cyan buttons.
- Portability: Firefox/Chrome/Edge share the one source tree and capability profile. Firefox stays the actual MV2 runtime. Chrome/Edge require MV3 DNR network-port and background conversion, currently blocked, and won't generate falsely advertised usable packages.
- Owner observed a successful Google-based NBCUniversal sign-in/account creation with current filtering. Retest on Build 239 before considering it a fresh acceptance; do not broadly allowlist Google traffic.
- Current status: real automatic Facebook sponsored-feed/sidebar removal not verified. Keep documented owner pass/provisional/known-issue history. The exact Build 239 full Ubuntu seven-phase and live browser tests remain pending.
- Public README has no release-status paragraph. Public website status omits adult and piracy-site names. Detailed historical QA may name particular test sites as needed for maintenance.

## Current browser acceptance (Build 232, owner-reported)
- **XNXX PASS:** User confirmed site works in Firefox with the new premium-banner and ad cleanup.
- **Facebook FAIL through Build 237; Build 238 owner retest pending:** The owner showed a surviving sponsored feed post that the investigator identified by its explicit sponsored-content menu. The automatic Facebook path now reuses that exact bounded post evidence; this is not yet a real-browser PASS. The right Sponsored rail also still requires confirmation.
- **CBS News PROVISIONAL:** Playback now runs, but a longer check across commercial breaks remains open.
- **Prior observed successes:** YouTube, Disney+, 1337x and The Pirate Bay; preserve their existing filtering and popup behavior.
- **Release remains blocked:** Full current Linux suite, security/performance evaluation, competitor coverage and Mozilla signing/owner release approval are not complete.


## Implemented source
- Firefox MV2 extension with bundled Ghostery 2.20.3 plus native filtering, filter-list subscriptions, content hiding, user/site exceptions, popup defenses, network inspection and locally exported blocked/allowed request summaries.
- Site-level cosmetic exceptions now govern supplementary Ghostery CSS (Build 159) and automatic DOM ad-slot recognition (Build 160).
- Build 161 corrected three identified test fixtures. Build 162 adds bounded synthetic native/Ghostery/hybrid verdict comparison, and registers the previously omitted runner self-test. No production blocking rule changes.

## Outstanding evidence / known risks
- **Offline suite**: complete current Build 218 Node/Python suite has not been executed and accepted. The historical complete pass belonged to Build 63. The independent Build 158 review found 690/693 Node cases passed and three fixtures failed.
- **Engine correctness**: Build 163 now consults Ghostery exceptions before enforcing ordinary native subscription blocks. Other precedence, unsupported syntax, important rules and real-browser compatibility remain unverified.
- **YouTube**: Build 167 records coarse first-load bootstrap observations. Build 168 adds a temporary YouTube test switchboard that separates response filtering, page-bridge filtering and observe-only diagnostics, without changing the default combined behavior. Existing first-party JSON transformations, page bridge and Skip Ad assistant have not passed real Firefox anti-adblock, preroll, midroll, ad-supported film and ordinary-video playback acceptance. No evidence of reliable ad-free playback is claimed.
- **Security and distribution**: complete permissions/privacy and Linux native-companion audit, long-session performance measurements, Mozilla signing and owner-approved release remain open.

## Next milestones and gates
1. Run **all seven offline phases** at exact Build 218 HEAD, resolve any remaining failures, record evidence.
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
Added training-time vendored karpathy/micrograd (with required upstream notices), seeded synthetic training, and a static JavaScript classifier that can only veto or recommend the controller's existing response-only fallback under strict safety gates. Included enforcement/ad-skip negative evidence. Fixed Build 185's missing adaptive-youtube.js background loader entry. Synthetic training 128/128 classification passed, NOT real-world ad detection or performance. No cloud/telemetry/runtime Python; full Linux and Firefox tests remain pending.

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

## Build 215: first separate local threat-intelligence database (unreleased)

- New `DKThreatDB` module reads only plain phishing hostnames from `https://phishing.army/download/phishing-army-domains.txt`, bounded to 12 MB/250,000 entries and rejecting markup, overly sparse/error responses, public suffix lookalikes and large unexplained coverage drops. It stores last-good source data in Firefox local extension storage and never uploads browsing URLs. A request to update the list does contact the publisher and can reveal the extension user's IP.
- Default `threatProtection:true` applies exact-host phishing blocks even when normal ad filtering is allowlisted; global off, a threat-specific checkbox, and explicit exact-host overrides all disable it as appropriate. Main-frame navigations are cancelled before query-stripping. Local UI shows source/count/updated/error; event evidence describes a phishing feed match, not an owner verdict.
- One verified phishing category only, not complete malware/scam/c2 protection. The feed may be missing before initial successful download, may go stale, may contain false positives and may not cover every subdomain or page path. Additional vetted sources and warning/recovery navigation experience are pending.
- Eight local module smoke checks passed in isolated JS, ninth source integration check registered in Linux suite. Full Ubuntu/Firefox acceptance remains pending, as does complete investigation card work.

## Build 216: on-demand public domain and network investigation (unreleased)

- A user clicking Investigate on a recorded blocked destination can see the fuller public RDAP registration object: registry handle, entity organization/name/email/phone/address **only when publicly returned**, roles, registration dates, status, DNSSEC, nameservers, notices, remarks and source links. Public ownership may still be redacted. Known operator hints and registrar/network ownership are clearly distinguished.
- Firefox DNS resolution displays A/AAAA addresses and available canonical hostname data. A single eligible public IPv4 address may undergo its own explicit IP-network RDAP query, revealing infrastructure registrant and network range, not necessarily domain owner. Private/loopback/link-local/documentation addresses are never submitted. Both research calls happen only after the same explicit user action; no per-site background reputation lookups are added.
- The local phishing-database presence and exact-host override flag appear as independent evidence. Updated Site Dashboard text panel and existing export methods retain these opt-in details, with size and string sanitization. Unknown facts remain labelled unavailable.
- Six focused tests passed in an isolated JS runner; original RDAP integration fixture was extended but has not been run in complete Node suite. Full Ubuntu/Firefox acceptance is pending.

## Build 217: browser-owned phishing warning and opt-in exact-host proceed (unreleased)

- Matching top-level HTTP(S) GET requests are redirected to a bundled Firefox extension warning, rather than a silent cancellation. Suspicious subresources and non-GET navigations remain cancelled as before.
- The interstitial identifies only the exact hostname, the Phishing Army feed and the cached source update date, with explicit caveats about possible false positives. The original URL's path, query and fragment are not copied to the warning, persisted to storage, or sent to the publisher.
- The background generates a 128-bit browser-crypto nonce tied to one tab and a three-minute in-memory record. An extension web-accessible page alone is not authorization. A proceeding user must acknowledge risk, then save a previously supported exact-host override. Only a clean HTTPS homepage for that hostname is opened. Error paths fail closed; close-tab is available.
- Added self-contained module/source and mocked Firefox-message regression tests; registered in the local seven-phase runner. Full local Node/Python suite and real Firefox page redirect tests have **not** been executed in this tool environment. Site/YouTube/video protections are otherwise unchanged. No GitHub Actions or public release.

## Build 218: offline YouTube evidence comparison (unreleased)

- The existing YouTube compatibility JSON report can now be analyzed in a separate `youtube-lab.html` page without uploading it or modifying any Firefox filter modes automatically. The Site Dashboard has an explicit link to the new lab. No existing UI geometry was moved.
- Two selected reports are size-limited and strictly parsed against the real v1 YouTube report format; internal comparison retains only allowed numeric counters and settings/mode enum flags. Hostnames, tab IDs, videos and raw network data are discarded. A user may explicitly export a sanitized comparison and manually label which video type, ads and playback were actually observed.
- Cross-mode comparisons call out meaningful mismatches, incomplete playback evidence, anti-adblock refusal, page-world event limitations and distinct response-filter counter changes. No claim that source-level changes are effective in Firefox or that ad-free playback occurred.
- New dedicated parser/compare/UI source tests are registered in the Ubuntu local suite. Their source was syntax-checked in an isolated runtime; the complete Linux Node/Python suite and real YouTube/Disney+ Firefox tests remain **unexecuted** and mandatory. Build 203 rollback and all blocking logic remain unchanged.


## Build 219: AMO submission engineering (0.3.189, November 1)

- Owner aims to submit DK Live Block to Mozilla Firefox Add-ons by **Friday, November 6**, but review and actual publication by November 7 are outside project control. Draft listing, reviewer notes, and exact candidate/release gates are in `docs/AMO_LISTING_DRAFT.md`, `docs/AMO_REVIEWER_NOTES.md`, and `docs/RELEASE_WEEK_2026-11-01.md`.
- New offline Python `scripts/amo-preflight.py` checks application licensing, vendor notices, manifest/package consistency, pinned dependency versions, and reviewer assets. `--report` is nonblocking for ordinary development while listing missing prerequisites; **`--strict` blocks candidate packaging** if anything is missing. Failure-injection checks run in the existing local release phase.
- `scripts/package-firefox.py --candidate` now checks strict source readiness before the complete seven-phase suite, includes the original-code `LICENSE` at extension ZIP root with existing upstream MPL notices, rejects symlinks/hidden/temp artifacts and duplicate license names, and verifies archive contents. It still creates no package without the explicit flag. No public release was made.
- **Hard blocker:** a real `package-lock.json` and byte-for-byte reproducibility of the pinned Ghostery bundle are missing/unverified. No fabricated lockfile or vendor hash was committed. Source builds require official npm dependencies and a successful exact-commit test run on the owner's Linux system.
- **Untouched:** all production ad/streaming filtering paths, the owner-approved UI geometry, Build 203 backup tag, one-branch `main` policy. Source documentation and packaging paths only, manifest user-facing description and version increment. No Actions.
- **Still open:** exact Build 219 complete local Node/Python results; clean Firefox/YouTube/Disney+/1337x/Pirate Bay stability and privacy acceptance; third-party source attribution/license review; final candidate source package, owner approval and Mozilla upload/review. No claim of AMO-ready status.


## Build 220 (0.3.190): effective permitted request reason evidence

Owner feedback exposed a specific limitation: the original permitted reports only grouped destination hostname and resource type and could not say *why* filtering allowed a completed request. The logged tab event now retains a capped, privacy-scrubbed reason identifier at `onBeforeRequest`, reconciles to successful `onCompleted` via private in-memory Firefox request ID, and records method, HTTP response code, completion time and stable sequence. Bounded per-tab summaries and individual event details are shown in the existing Site Dashboard and both TXT/JSON permitted exports. The decision category identifies what DK did, not whether a request is harmless or exactly what its server-side action was. Unknown decisions are labeled as such. No raw URLs, paths, queries, cookies, headers, content or private IDs enter exports. Historic reports cannot be retroactively enriched. Focused V8 syntax/privacy smoke passed; the full seven-phase suite and live Firefox verification remain pending. There were no changes to filtering outcomes, YouTube/Disney+ ad blocking, popup interception, approved UI layout, branch or Actions policy.

## Build 221 (0.3.191): vendor provenance gates, unreleased

The pinned Ghostery vendor compiler can now verify an in-memory rebuild against the **existing** bundled JavaScript without changing files. AMO packaging refuses to proceed if exact bytes differ; release preflight demands a real official-registry SHA512-verified transitive lockfile instead of accepting a superficial version-only JSON file. Four mock compiler tests and negative lockfile tests are included in the full Linux runner. The current repository still lacks an authentic `package-lock.json`; actual `npm ci`, exact Ghostery match, seven-phase local suite and clean Firefox acceptance are NOT confirmed. This build does not change any ad blocking, streaming or popup decisions. The Build 203 user-observed-working tag remains the rollback reference.

## Build 222 (0.3.192): observed preroll missed and narrowly targeted mitigation

November 1 Firefox test on a video-sharing site showed an actual advertising preroll with **0 blocked** and **46 permitted** requests; export grouped nine destinations. Protection was on and the site was not allowlisted. One permitted `media` request used `n2j9y0x0.bxcdn.net`; other media used the site's normal CDN. Internal fallback now blocks this exact outside CDN **only for media loaded on xnxx.com**. It is a best-evidence candidate fix, not an observed pass. The source does not touch YouTube/Disney+/BBC or neighboring site traffic. Focused native matcher cases agreed with the intended host/type/site separation; full seven-phase Linux checks and genuine Firefox post-fix playback are pending. The earlier local permit TXT lacks the newer Build 220 decision reasons, so exact running-source version should be confirmed before comparing exports.

## Build 224 (0.3.194): discoverable source, release metadata and link safety

The official GitHub repository is now linked in the existing toolbar footer and Settings Help area with an HTTPS destination and safe new-tab attributes. Firefox's add-on manager can show the same homepage through `homepage_url` in the manifest. An independent offline extension-structure test and AMO preflight negative checks reject missing, swapped or unsafe source links. This work does not alter network rules, YouTube/Disney+ handling, popup suppression, permissions, or control placement. Full Linux testing, browser acceptance, a genuine npm lockfile, an exact Ghostery rebuild, and explicit release approval remain outstanding.

## Build 225 (0.3.195): corrected original-tab behavior and repaired regression inventory

The Build 223 original-tab takeover guard could cancel a deliberate same-tab visit solely because the request's origin came from a video page. It now requires a recent, actually recorded source-linked second tab, while preserving existing site/destination matching and normal protection/allowlist decisions. This narrower rule avoids false-positive cancellation of deliberate browsing. The dedicated regression test file, previously omitted from the Linux runner, is now registered and backed by a structure/load-order assertion. Prior isolated production-module regression callbacks passed (5/5) after tightening; **full seven-phase Linux Node/Python and actual Firefox acceptance have not passed or been run for this revision.**

The owner also directly compared Disney+ CSI: Las Vegas with DK OFF (ads appeared) then ON (ads disappeared); this is an observed success and a regression-protection baseline, not a guarantee of universal streaming ad suppression. No streaming or Disney+ filtering changes were made. The npm registry was not resolvable here (EAI_AGAIN), so a real generated package-lock and an exact Ghostery vendor rebuild remain unresolved release blockers.


## Build 226 (0.3.196): optional Patreon link enabled in both existing controls

The owner-provided Patreon creator page `https://www.patreon.com/c/dkliveblock` is activated in the toolbar popup and Settings footer via existing `DKSupport.installButton`. The shared helper strictly validates exact HTTPS Patreon creator URLs and opens them only after a user click, without tracking query parameters, automatic navigation, log transmission or new permissions. The HTML remains initially disabled (fail closed) until initialization; the visible label is now correct. No feature paywalls, forced support messages, changes to filtering/streaming/permissions or interface layout. Full Linux/Firefox release acceptance is outstanding.

## Build 227 (0.3.197): restore user-picked element hiding; CBS article autoplay gate

The owner observed the right-click picker highlights a selection but does not hide it. The picker now requires an acknowledged successful `addElementRule` save before applying an immediate dedicated cosmetic stylesheet, with a clear retry banner on errors. Background returns a bounded exact-site list of explicitly saved cosmetic selectors separately from the ordinary 15,000-character filter CSS budget; pause/Undo drops the local stylesheet on refresh. The background validates content-only active-tab writes, rejects malformed/oversized selectors and duplicate rules, caps total saved rules at 1 MB, and persists settings. No network blocking, vendor or streaming changes.

CBS News article tabs receive narrowly scoped, explicitly click-to-play HTML5 video protection in all frames of the originating tab through a new local helper. It removes autoplay from unapproved videos and pauses unsolicited `play` events, while allowing trusted interaction in the video's actual player controls. CBS home, live and standalone videos, unrelated sites and direct streaming tabs are not opted in. Inline video inside cross-origin embeds may need live Firefox validation. Only local DOM events, no surveillance or extra permissions. Owner-observed CBS ad suppression and working Patreon preserved.


## Build 228 (0.3.198): user-initiated CBS playback and nonpersistent picker

Owner-verified: Build 227 CBS article videos stopped autoplay, but manual Play could spin forever. The 227 script continued pausing video on `play` and mutations even if a replacement player was initialized after a user click. Build 228 treats a trusted click inside the actual video rectangle or a player control as authorization, then removes the play interceptor and mutation observer until document navigation. Other article clicks do not unlock playback. No changes to network filters, streaming sites, support link or approved UI geometry.

Owner-verified: Block Element hides chosen items, but saving them across reloads is not wanted. Build 228 keeps newly chosen selectors in page memory and applies local CSS only; a normal webpage reload resets all new manual picks. The toolbar Undo hide restores latest page-only pick first; older saved picker rules remain in custom rules and can be removed using Undo hide. No automatic deletion of user custom filter rules.

Owner observed extensive CBS advertising with extension disabled and an ad-free usable page with extension enabled. Manual Firefox validation of Build 228 playback remains pending.


## Build 229, 0.3.199 (November 1, 2026)

Owner also observed a black unplayable CBS News homepage video box, beyond the previously reported CBS article spinner. The CBS request report showed `doppler-config.cbsivideo.com` blocked; a public compatibility issue specifically named the host as a possible video dependency. Build 229 permits only HTTPS script/XHR to that exact host when the top-level page is CBS News, preserving other CBS advertising filters. It also removes old CBS News permanent cosmetic rules written by the former picker, protects recognized CBS player containers from cosmetic lists, and removes the background element-picker save route. New manual picks stay in document memory until page refresh. Explicitly entered settings custom rules remain intentionally persistent. Browser playback and ad suppression must be retested; no guaranteed fix claimed.

GitHub Pages root and docs HTML updated. The setting designating its source cannot be read through this connection, so both are provided. A Google Drive package link is not created without a tested package and actual public Drive URL.

Build 229 follow-up: extend the existing CBS autoplay guard from article pages to the main CBS News homepage (/), while retaining the manual Play release. Other CBS live/video paths are excluded.
