# DK Live Block: comprehensive competitor-parity build plan

**Date:** 2026-10-31. **Status:** UNRELEASED; no parity claim until independently verified. **Source baseline:** 0.3.35 (Build 65).
**Competitors reviewed:** uBlock Origin, AdGuard Browser Extension, Adblock Plus, Ghostery, Brave Shields. See `ADBLOCK_ENGINE_RESEARCH_2026-10-31.md`.
**Development policy:** one accepted build at a time; README intro, tests and release notes before completion; no GitHub Actions, external user setup, automatic website opens, surprise ZIP/executable/public release, or UI geometry changes.

## Milestones and acceptance gates

| Area | Scope of work | Current status | Verification required |
| --- | --- | --- | --- |
| 01 Foundation | Firefox install, bundled engine, no runtime npm | Implemented, local tests | Reproducible clean profile install |
| 02 Lists | EasyList, EasyPrivacy, annoyances, language lists, update schedules, offline cached fallback | Partial | Network/cache tests and review |
| 03 Network parser | ABP rule types, exceptions, important/badfilter, domain constraints, CNAME issues, redirects, response headers, aliases | Partial | Cross-engine fixtures and differential tests |
| 04 Cosmetic filtering | Standard selectors, exceptions, extended/procedural and shadow DOM, dynamic refresh, undo | Partial | Browser DOM fixtures, accessibility tests |
| 05 Scriptlets | Trusted, bundled named scriptlet catalog; page-world bridge; site-scoped policy; CSP handling; automatic revoke | Not implemented | Injection/rollback tests; no arbitrary downloaded JS |
| 06 Redirect resources | Bundled noop shims and bounded resource substitution; narrowly matched filter syntax | Not implemented | Correct MIME, exception precedence, playback-safe |
| 07 First-party ad responses | Safely match *small* known ad metadata responses; never mutate media bytes, login or arbitrary JSON | Not implemented | Opt-in fixtures, fail-open cases, Firefox playback |
| 08 YouTube | Pre/mid/post-roll, Shorts, ads in feeds, live and free-with-ads films; anti-detection | **FAILING** | Playback AND ad-free AND no enforcement across sessions |
| 09 Streaming compatibility | Disney+, RUTUBE, other major sites without breaking DRM, login, navigation | Incomplete | Browser tests; avoid login rate limits |
| 10 Reporting | Blocked request details, permitted request details, TXT/JSON exports, counted activity, owner hints, responsible rule/source | Partial | Privacy assertions, export round-trip, counted correctly |
| 11 Network monitor | All/blocked/allowed/mixed streams, filters, CSV, performance bounds, per-tab history | Partial | Long-session memory and DOM tests |
| 12 Per-site controls | Allowlist, temporary pause, per-type/host toggles, protected sign-in resources, status icon | Implemented; testing | Real Firefox toggle/restore regressions |
| 13 Anti-popups | Popunders/new tabs, whitelist one-time tab, overlay recovery without removing players | Partial | Adversarial browsing and rollback |
| 14 Anti-anti-adblock | Classify site nags versus actual playback refusal; trusted scriptlet work | Partial | No false playback success |
| 15 Privacy | Tracking params with HMAC/signed URL safeguards, cookies, fingerprint protection where feasible | Partial | Leak checks, breakage regression |
| 16 Consent & annoyances | Cookie reject only when explicit, newsletter/subscribe widgets, shadow DOM | Partial | Many CMPs, keyboard/focus safety |
| 17 Custom filters | Syntax lint, exception priority, import/export, trusted source controls | Partial | Round-trip and no script execution |
| 18 Performance | Rule indexing, incremental cache, startup memory, no per-request heavy DOM work | Partial | 8GiB Ubuntu and heavy tabs benchmark |
| 19 Security | Tight message origin validation, no untrusted remote JS, supply-chain review, MPL notices | Partial | Static audit, fuzzing, security checks |
| 20 Multi-site diagnostics | Per-tab export, optional all-current-tabs combined report with consent and strict limits | Incomplete | Cross-tab isolation and opt-in privacy |
| 21 User experience | Clear defaults, zero promotional ads/Acceptable Ads, accessible toggles, status, bug email | Partial | Firefox review and accessibility |
| 22 Firefox packaging | Fully bundled signed XPI, source disclosure, AMO submission without Actions | Not released | AMO review and explicit approval |
| 23 Documentation | Feature guide, bug-report workflow, no release-note stuffed README, transparency | Partial | Build/readme reviewed |
| 24 License/compliance | Owner's non-commercial preference vs current MIT license; MPL/GPL compatibility | **Decision needed** | Lawyer/owner review before distribution |
| 25 Final competitor comparison | Document actual implementation and Firefox tests against ABP/uBO/AdGuard | Not completed | No premature parity claim |

## Planned sequential source builds

- **Build 66:** TXT/JSON exports of *permitted* per-tab requests, including approved manual toggles, exact host/type group counts, operator caveats, individual and all views.
- **Build 67:** Narrow filter provenance and rule fingerprint diagnostics; distinguish native list, user rule, bundled seed, vendor matching. Never expose raw URL paths, tokens or opaque filter text.
- **Build 68:** Local-only Ghostery cosmetics capability probe and safe selection of style rules, without enabling arbitrary vendor JavaScript. Separate scriptlet dispatch design and tests.
- **Build 69:** Core allowlist/anti-enforcement instrumentation and YouTube first-party XHR false-positive triage; no blanket exemptions or player-response hacks.
- **Build 70+:** Stable trusted scriptlet catalog (audited, static), compatible page-context bridge, opt-in YouTube small-response metadata support, then browser-only acceptance. Avoid irreversible fallback or DRM circumvention.
- **Future:** Redirect shims, filter list performance work, combined report, standards/UX/accessibility, AMO policy and licensing review.

## Release / evidence gates

A phase is not **accepted** until (1) source and README accurately reflect limitations, (2) regression suite passes on Ubuntu, (3) significant browser-facing features are validated in Firefox and tested against normal login and media, (4) reproducible accepted snapshot -> local commit + annotated tag -> GitHub push + verify, and (5) owner authorizes release. Research and commits here are development, NOT acceptance.

Technical honesty: YouTube may change its defenses again, so permanent 100% ad-free compatibility is not guaranteed. Broad resource blocking, silently showing ads, or hiding a refusal behind a black player is **never** a success.

## Development implementation delta: Builds 73–79 (2026-10-31)

The original 25-milestone acceptance table remains the release contract. The following **source-level implementations** are now present but **NOT accepted as working in live Firefox**:

- **Milestone 05, scriptlets:** one static, trusted YouTube-only MAIN-world JSON hook. **Not** general scriptlet filter syntax, catalog or comprehensive uBO compatibility. Page-world JavaScript can observe/alter page hooks; DOM control events are **not** a security boundary against a hostile website.
- **Milestone 06, redirects:** only the two inert, local resources `noop.js` and `empty.css`, with explicit type guards. More redirect resources remain.
- **Milestone 07, response transformation:** bounded Firefox response filtering for a small set of direct YouTube player JSON responses, with unknown/oversized responses passed through. Does **not** touch media bytes or every player schema.
- **Milestone 08, YouTube:** player request pass-through for known eligible calls, a constrained fetch/XHR bridge, initial player-data handling and nested stringified JSON support. Ad-supported films, player refusal and anti-detection **remain failing in user-observed baseline** until live retesting demonstrates otherwise.
- **Milestone 10, diagnostics:** one-click YouTube-specific TXT/JSON export and limited response-filter counters. Counts aren't proof of success; overall capture/performance still partial.
- **Milestone 12, controls:** persisted on/off for YouTube response filter, plus existing site/request toggles. Tested in mock integration only.

**Current source baseline:** v0.3.49, Build 79. No full post-72 Node/Python on-device run, and no real Firefox/YouTube acceptance. No release or competitor-parity assertion. Next work is broad rules/scriptlets, differential regression suite, real browser acceptance, security review and performance. Do not solicit premature routine user tests or publish a release.

## Source progress through Build 107

Recent source work adds bounded YouTube player/feed/Shorts handling, relative request support, SPA refreshes, timeout and memory safeguards, per-tab diagnostics, narrow UTM query cleanup, safe multi-site literal procedural cosmetics, and a cross-feature local regression contract. The complete local suite now registers 111 JS files, but the full Node/Python suite and actual Firefox video/ad-blocking acceptance remain open. This work does not establish competitor parity or authorize a release.
