# DK Live Block: current engineering state

**Source snapshot: Build 194 / 0.3.164 (2026-11-01), unreleased.**
This document describes verified repository state and missing acceptance evidence; it is not a parity claim.

## Implemented source
- Firefox MV2 extension with bundled Ghostery 2.20.3 plus native filtering, filter-list subscriptions, content hiding, user/site exceptions, popup defenses, network inspection and locally exported blocked/allowed request summaries.
- Site-level cosmetic exceptions now govern supplementary Ghostery CSS (Build 159) and automatic DOM ad-slot recognition (Build 160).
- Build 161 corrected three identified test fixtures. Build 162 adds bounded synthetic native/Ghostery/hybrid verdict comparison, and registers the previously omitted runner self-test. No production blocking rule changes.

## Outstanding evidence / known risks
- **Offline suite**: complete current Build 188 Node/Python suite has not been executed and accepted. The historical complete pass belonged to Build 63. The independent Build 158 review found 690/693 Node cases passed and three fixtures failed.
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
