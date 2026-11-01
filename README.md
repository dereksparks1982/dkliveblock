# DK Live Block

**Firefox-first ad and tracker blocker by DK LAB / Elderred Softworks.**

**Unreleased development source: 0.3.152, Build 182.** Firefox testing, YouTube/Disney+ playback and full Adblock Plus equivalence have not yet passed the required acceptance checks.

## What it does

- Blocks common display ads and trackers with bundled Ghostery technology and configurable EasyList/EasyPrivacy subscriptions. Native rules can distinguish HTTP methods to avoid treating POST-only and GET-only requests as interchangeable. Conservatively applies additional local Ghostery cosmetic CSS on non-streaming websites.
- Adds bounded YouTube sponsored-feed and Shorts advertising-entry filtering in the existing first-party response path, with direct module and Firefox MAIN-world loading tests and without altering ordinary feed items. Live effectiveness remains unverified.
- Adds narrowly scoped script and stylesheet substitutions using two bundled inert resources. Rules must explicitly match the resource type, and no external replacement scripts are executed.
- Adds conservative automatic ad-slot recognition for explicitly labelled ads, including dynamically added and open-shadow components.
- Lets users allowlist websites, manage subscriptions, edit filters, pick elements to hide and restore unwanted hiding.
- Stops many unwanted popups, new tabs, cookie prompts, newsletter distractions, short VPN nag banners, recognized RUTUBE promotional offers and tracking parameters.
- Includes a **Site Dashboard** to inspect the selected tab's protection state, up to 250 individual blocked events with TXT/JSON one-click export, privacy-safe matched filter source attribution, service-operator hints, explicit RDAP registration research and active exceptions, with clear controls to revoke allowances. Permitted completed requests are counted separately, exported as local TXT/JSON reports (all groups or one inspected destination); voluntary combined TXT/JSON diagnostics cover up to 25 currently open website tabs, grouped by hostname/type, and can be selectively blocked and unblocked with explicit toggles, including on otherwise allowlisted websites. Detailed network inspection and playback diagnostics include site refusal, buffering, media errors, and a coarse YouTube first-party blocked-request triage.
- Adds bounded Firefox-only first-party YouTube player-response ad metadata filtering plus a bundled, setting-gated MAIN-world scriptlet for first-party player JSON via fetch/XHR, with a reversible setting, memory-limited concurrent response filters and per-tab request-to-response diagnostic counters and a dedicated one-click YouTube TXT/JSON compatibility report. Known advertisement metadata in the existing initial player bootstrap is also pruned when activated. Matching first-party player JSON requests are permitted through ordinary network rules so response filters can operate, while explicit user blocks and unrelated advertising rules still apply. This is an experimental compatibility improvement, not proven live ad-free playback.
- Offers optional video watch-later features and Linux companion integrations; optional features are still under development.

## What makes it different

No paid tiers, Acceptable Ads, sponsored placements, promotional messages or telemetry. Ad and tracker protections are enabled by default. Optional cookie rejection attempts only explicit rejection choices, never an Accept All fallback. Users can control exceptions.

End users will not need Node.js, npm or a separate Ghostery installation: the filtering engine is bundled into the source. Filter-list updates still contact their published providers.

**Advanced cosmetic filters (Build 172):** DK now supports a conservative, literal-only `:matches-attr(name=value)` procedural filter on explicitly scoped websites, including exact exceptions. Regex-based attribute filters, scriptlets and arbitrary procedural actions are deliberately unsupported. Site protections and current YouTube interception are unchanged.

**Current toggle state in exports (Build 173):** blocked-request and YouTube TXT/JSON reports now distinguish an event blocked in the past from a current remembered Allow or explicit manual Block on the same host/resource type. These remain privacy-sanitized site-level summaries, not per-URL rules.

**Build 174 security hardening:** messages with a browser-supplied foreign origin but no tab are no longer treated as trusted extension UI. Malformed website-exception settings now fail validation before any settings are changed; persistent request-allowance storage failures are covered by a rollback regression test. No new permissions or user-facing controls.

**Build 175 native filtering optimization:** The native matcher now reuses the already-parsed request hostname, avoiding duplicate URL parsing, and skips token scanning when no unanchored token-indexed rules are installed. Candidate order, page exceptions, request types, Ghostery arbitration and YouTube responses remain unchanged. The offline benchmark now counts hostname parses per request; full Linux and Firefox measurements are pending.

**Build 176 YouTube regular-video timing improvement:** the bundled first-party page bridge now rechecks newly arrived initial player metadata at 1 and 3 seconds and after YouTube's `yt-navigate-finish` single-page navigation event. It preserves content, watch metadata and refused responses, and does not modify observe-only test mode. The voluntary local YouTube report now indicates whether the late check actually removed known ad metadata. **This is not verified ad-free ordinary-video playback.**

**Build 177 competitor-informed filtering:** Reviewed uBlock Origin's actual GPLv3 scriptlet and JSON-pruning architecture. DK's own YouTube main-world bridge now includes a **fixed-purpose, reversible, first-party `JSON.parse` player-metadata interceptor**, covering player data that bypasses fetch/XHR response wrappers. This does not execute untrusted filter-list scripts, copy GPL code or alter media bytes; existing site allowlisting and temporary observation mode still disable it. Real Firefox YouTube ad removal is not yet verified. See `docs/BUILD_177.md`.

**Build 178 filter-engine compatibility:** Bundled Ghostery verdicts can now activate **only** two independently packaged, inert local redirect resources (`noop.js` for scripts and `empty.css` for stylesheets), even for domain-scoped list rules that DK's native parser does not understand. The adapter never follows Ghostery's data URLs or any remote script. Tested against the real embedded Ghostery parser with a native-unsupported entity-domain rule. This improves rule support, but **ordinary YouTube ad-free playback remains unverified**. See `docs/BUILD_178.md`.

**Build 179 syntax coverage:** DK now understands the domain-scoped, hide-only subset of `:style(display:none!important)`, including per-site cosmetic exceptions. It translates only safe hiding cases to ordinary CSS while rejecting arbitrary styling, whole-document/video selectors, and executable rule content. The offline audit reports this subset separately from unsupported `:style()` syntax. **Real YouTube preroll/midroll blocking remains unverified and known incomplete.** See `docs/BUILD_179.md`.

**Build 180 YouTube first-load coverage:** the existing, site-scoped player bridge can now examine new `ytInitialPlayerResponse` assignments immediately in active mode, without waiting for its fallback timer. The hook is reversible and refuses locked or accessor-backed globals. It does not alter normal stream data, video titles or playback refusals. **Actual ad-free playback still requires Firefox testing.** See `docs/BUILD_180.md`.

**Build 181 filtering correctness:** the hybrid engine now respects a bundled Ghostery `$important` subscription match even when DK's native parser recognized only a weaker exception. Manual user choices still outrank subscriptions. Test fixtures demonstrated the mismatch with real embedded Ghostery and verified the corrected priority. **Live YouTube ad blocking is still unverified.** See `docs/BUILD_181.md`.

**Build 182 advanced cosmetics:** DK now supports a bounded, site-scoped, literal `:matches-css()` procedural subset. It recognizes selected computed CSS properties and hides matched elements reversibly using existing player and identity safeguards. It does not allow downloaded regexes, arbitrary style mutations or executable scriptlets. **YouTube video ad-free playback remains unverified.** See `docs/BUILD_182.md`.

## Development status

**Offline test gate:** Build 171 registers a read-only audit of all packaged extension assets and HTML script/styles across 10 pages, in addition to the Build 161 full-phase gate. The audit was checked against the exact Build 170 GitHub tree, finding 87 existing references and no missing paths. Build 161 corrects three stale or isolated test fixtures identified by the Build 158 independent review. The local runner now completes and summarizes all seven phases even if one fails, with Node TAP totals and individual Python companion failure counts. The complete current checkout has **not** yet passed this runner; previous green results belong to earlier commits. Firefox playback acceptance remains outstanding.


This is NOT a publicly released or Mozilla-signed extension. Video ads can be inserted server-side, browser extensions cannot remove every ad, and protected streaming playback may be restricted. Optional proxy/network recovery is not an anonymity guarantee.

A developer can load the unpacked source from src/manifest.json through Firefox about:debugging. Local regression checks use bash scripts/test-local.sh. The two Node test phases are capped at two workers to reduce peak RAM, and a suite inventory guard verifies that no test files were forgotten. A synthetic manual QA lab is available through python3 scripts/qa-lab.py on localhost without automatically opening a browser. This does not replace real-site testing.

No GitHub Actions, hosted build runners, automatic releases, or public downloads are authorized.

## Support and reference

**Bug reporting:** elderredsoftworks@proton.me. Users can use Report a Problem in the extension to prepare and review an email draft; no report is sent automatically.

- [Support and reporting instructions](SUPPORT.md)
- [Roadmap and outstanding tests](docs/ROADMAP.md)
- [Archived build history](docs/CHANGELOG.md)
- [Feature comparison with Adblock Plus](docs/ABP_PARITY_CHECKLIST.md)
- [Manual browser QA lab](docs/QA_LAB.md)
- [Firefox publishing requirements](docs/FIREFOX_MARKETPLACE.md)

## License

Original application source is currently MIT licensed. Bundled Ghostery and Mozilla Public Suffix List components use MPL-2.0 and third-party filter lists have their own license terms. A future licensing decision does not revoke MIT rights already granted.

**YouTube compatibility testing:** The Site Dashboard now has a collapsed, temporary test-mode selector for the current YouTube tab. Use Normal, Response only, Page bridge only, or Observe only, then manually reload the video page and export YouTube diagnostics. Observe only disables player JSON rewrites, not DK's ordinary network rules; it does not claim ad-free playback. Temporary selections expire automatically and are not stored in Firefox settings.

**Blocked-request controls:** Blocked history now has reversible site + destination hostname + resource-type Allow switches next to each Details action. Switches affect future requests only, never past requests or individual URL paths. An explicit warning precedes granting persistent allowances. Popup rules and manual selective blocks retain their separate protections.

**Unified YouTube diagnostics:** A standard blocked-request TXT/JSON export now also includes privacy-scrubbed player-response counts, temporary experiment mode and first-load bootstrap observations, without requiring a separate YouTube diagnostic export. Empty health observations do **not** prove ad-free playback.
