# Build 269 / v0.3.239 (Nov 2, 2026)
Agent Nesty Meta-04: src/facebook-ads.js now stores short-lifetime ID labels as {value,at} and guards current live targets, expiring evidence after 15 sec to avoid false positives when React recycles IDs. src/orion-pause.js rejects commands for a different hostname and corrupt saved settings; src/orion-popup.js requires active tab URL and sends site with every message. 13 synthetic regression cases added to tests/meta-orion-guards-build269.test.js and registered in runner. Full local Linux suite and actual browser/device tests still needed. Core Protections site unchanged. Default Meta GraphQL OFF.

# Build 268 / v0.3.238 (Nov 2, 2026)
Orion experimental candidate gets src/orion-pause.js (host-only 100-max local pauses, storage failure preserves paused state) and src/orion-popup.js, integrated into src/orion-dom.js and its packaging. Desktop Firefox UI and permissions unchanged. 7 Node test cases registered in the Orion pause fixture, runtime syntax checked; no full Ubuntu test or Orion device verification. Core Protections website unchanged. GraphQL OFF.

# Build 267 / v0.3.237 (November 2, 2026)
Orion DOM experiment now processes all 40 mutation records, avoids early exits losing ephemeral Sponsored labels, protects pagehide/pageshow timer generations, and reacts to iPhone visibility changes. Firefox content observer also processes all 40, not breaking after both popup/ad signals. New tests/orion-lifecycle-build267.test.js has 11 isolated passing VM scenarios and is registered in the Linux suite. User-approved website heading is Core Protections, and other layout is unchanged. GraphQL remains OFF; live Facebook/Orion unverified. See docs/BUILD_267.md.

# Build 266 handoff (November 2, 2026)
Current extension v0.3.236. First website group heading is **Core Protections**, second is **Guides, updates & projects**; both have no extra instructional paragraph. New src/meta-agent-nesty.js contains three always-local ad evidence helpers integrated into existing src/facebook-ads.js, also included in the Orion DOM-only package. Strict ad and organic boundary logic remains in Facebook's existing scanner; no stand-alone vendor engine. 11 new synthetic cases passed in JS evaluation. Corrected 29 omitted tests in scripts/test-local.sh; now 169 listed, but full seven-phase offline Ubuntu suite is NOT verified. Meta GraphQL response filter remains OFF, no Facebook live PASS. Continue alternating Meta evasion simulations and Orion/browser packaging work. docs/BUILD_266.md has detail.

# November 2, 2026: Orion foundation and overdue website corrections

Website fixes committed: 696a11aa51f49cbbd29886820a96da9ea77115f1. Preserved the 'What it does' and 'Guides, updates & projects' headings but removed both instructional paragraphs; inserted internal dividers on all twelve cards; centered twelve SVG close X marks; enlarged XPI icon/label and made GitHub/Patreon SVG artwork same-color; added approved DK Apple touch icon in root/docs with matching webapp manifests. Firefox iPhone may still show fallback letter; verify on device.

Orion platform study: actual Mac desktop and iPhone browsers exist; Linux beta maintenance ended on 2026-10-02; public OrionBrowser GitHub org has four smaller projects, not complete browser source. iPhone extension API support is partial. This new slice provides a DOM-only Orion candidate package source, NOT a verified fully working Orion blocker. See docs/ORION_COMPATIBILITY.md.

Facebook: Build 265 GraphQL response filter stays default OFF. Continue Agent Nesty evasions and regression fixtures in alternating builds; no definitive live Facebook PASS. New Orion DOM experiment shares current DK Facebook recognizer and MUST NOT claim first-party request blocking.

# DK Live Block: project handoff (November 2, 2026)

Use this file when a ChatGPT thread reaches its length limit. Confirm live GitHub `main` before editing; previous summary notes may lag behind repository content.

## Latest work (Build 265 / v0.3.235, November 2, 2026)
- Current head contains Facebook GraphQL fail-open response transaction improvements in `src/meta-graphql.js`: if one JSONL line is malformed, includes unknown plain text, or signals GraphQL errors, the *whole* response remains unedited. A top-level error also prevents modifications in nested `__bbox` response envelopes.
- Facebook streams now use a 4-second idle timer that renews on data, plus a 20-second total lifetime and 2,048 chunk cap. Excess buffering and timeouts return unmodified response chunks. New tests simulate timers, UTF-8 failures, concurrency and fallback.
- `src/facebook-ads.js` additionally recognizes a Sponsored accessibility label on buttons/links inside the right rail. Contacts and left-side controls remain protected by strict geometry and section checks.
- Current `metaGraphqlFilter:false` default **must stay off** until real signed-in Firefox data and compatibility checks. The DOM path remains active under existing ad recognition.
- **34 targeted isolated JavaScript tests passed** (Build 263/264/265). Full `scripts/test-local.sh` and browser acceptance were *not* completed; older independent audit security tests and Build 203 YouTube A/B remain outstanding.
- Build record: `docs/BUILD_265.md`. Manifest, package, README, Pages copies and handoff all updated together.
- No new third-party dependencies, permissions, GitHub Actions, sound changes, telemetry, account data collection or unapproved UI moves.

## Prior work (Build 264, November 2, 2026)
- Version `0.3.234` (historical Build 264). Expanded GraphQL/JSONL ad detection in `src/meta-graphql.js` for named Marketplace and news-feed response shapes; added bounded nested `require` / `__bbox` transport traversal. Generic responses unchanged.
- Facebook DOM right-rail `Sponsored` multi-span label prefilter fixed in `src/facebook-ads.js`.
- Regression files: `tests/meta-graphql-build264.test.js` and `tests/facebook-rail-build264.test.js`; 20 targeted Build 263/264 checks passed in isolated JS. Not live Firefox acceptance and not the full offline Linux suite.
- **GraphQL filter stays disabled by default** (`metaGraphqlFilter:false`), especially because upstream Facebook response rewrites have caused reactions/content breakage. Do not enable automatically without user's focused QA.
- Build notes: `docs/BUILD_264.md`. Public Pages two mirrored HTML files updated for version only.
- Handoff priority: full Node suite; fix security-contract failures; real owner Facebook/YouTube acceptance. Avoid further speculative GraphQL edits without fixtures.

## Repository, versions, release order
- Repository: https://github.com/dereksparks1982/dkliveblock
- Active branch: `main`; extension version **0.3.235 / Build 265** in `src/manifest.json` and `package.json`.
- Official Pages: https://dereksparks1982.github.io/dkliveblock/
- User expects direct repo updates, no downloaded patches or repeated terminal commands unless specifically requested. Never introduce custom GitHub Actions; GitHub Pages still invokes managed build/deploy checks for pushes.
- Do not claim live Firefox acceptance from synthetic JS checks. Keep README description accurate, release notes/version updated for extension changes, and do not move approved UI geometry without permission.

## Approved website design
- `index.html` and `docs/index.html` must remain **identical**.
- Two groups of six equal-height dark info cards; each entire card is clickable and opens an HTML `<dialog>` with longer educational text. Both groups dark; owner rejected white lower cards.
- Top close control is a cyan **×** only, with accessible `aria-label` and >=44px touch target. Bottom **Back to top** is conditionally visible only on panels needing scrolling and must scroll within the open dialog, not close it.
- The website's four hero links and the three Elderred site buttons remain unchanged. Other projects shown: Hanafi Learning Deck, Folkhold and Capital & Consequence; no Nougat Media Plus.
- User-supplied local MP3 `assets/sound/dragon-studio-button-press-382713.mp3` by **DRAGON-STUDIO** from **Pixabay** plays on actual clicks of cards and website buttons, not on page load. Served from the same Pages origin, with safe fallback on playback error; not a network request to Pixabay.
- Attribution in `docs/ATTRIBUTIONS.md`, linked in README and licensing information. License: Pixabay Content License, not DK proprietary license.
- Page regressions in `tests/website-education-hub.test.js`. Real Firefox/mobile visual/audio acceptance remains outstanding.

## Extension implementation snapshot
- DK Live Block is a Firefox-first ad/tracker blocker. Ghostery-based engine, subscriptions, request inspection/toggles and optional streaming subsystems present. No acceptable-ads or monetized features.
- Facebook: selected techniques from MIT-licensed upstream reference integrated in `src/facebook-ads.js` for feed/side-rail/Marketplace/mobile Sponsored signals; safety checks to protect normal posts, cleanup on recycled DOM, local count-only diagnostics. See `docs/BUILD_260.md`–`docs/BUILD_262.md`.
- **Meta GraphQL/JSONL** module `src/meta-graphql.js` (introduced in Build 263, extended in Build 264 with Marketplace feed units, sponsored story evidence and bounded `__bbox` envelopes); `metaGraphqlFilter` defaults **false** until actual Firefox verification and real response-shape testing. Never enable by default based only on synthetic fixtures.
- Agent Nesty cookie observers: `agent_nesty_1` HTTP set-cookie metadata observer; `agent_nesty_2` and `agent_nesty_3` standby, not cookie enforcement. Do not claim values blocked or saved.
- UI localization: English baseline and first partial Russian translation, with English fallback. Arabic, Turkish, Urdu, Persian/Farsi later, not selectable until implemented.
- Competing YouTube/blocker parity, live Facebook ad coverage, malware navigation, popup breadth and performance remain unverified. The user observed strong ad blocking at some sites, but this does not constitute universal acceptance.

## Priority technical debt before accepted release
1. Run **entire** `scripts/test-local.sh` offline on user's Ubuntu checkout. Independent auditor claimed 13 of 1055 tests failed on an older source; this report has not been fully reproduced/cleared.
2. Address security-contract failures (including content script settings boundaries), document/main-frame `$document` / `$all` matching, popup scope, regex candidate volume, and overly broad `proxy`/`dns` install permissions.
3. Firefox A/B YouTube against Build 203 known-working baseline (tag), plus Facebook DOM + GraphQL real response data with owner consent and no sensitive payload logs. GraphQL remains opt-in/off.
4. Verify Pages sound, client-side interactions, 12 dialogs, short dialog conditional Back to top and mobile × at narrow widths.
5. Keep each build substantial, versioned and documented; do not resurrect Nougat web link or use GitHub Actions.

## Development workflow reminders
- Avoid password prompts, auto-open browser tabs, GitHub Actions workflows, invented terminal commands or claims of live testing without evidence.
- Public repository must not mention internal private language names.
- Use precise summaries, accurate attribution, owner-approved UI geometry, and avoid deleting working content.
- This document should be updated whenever a new session materially changes the repo.
