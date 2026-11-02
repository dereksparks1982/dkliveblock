# DK Live Block: Company Modules & Advertising Intelligence Architecture
**Owner direction:** November 1, 2026. **Status:** approved development direction, not a claim of implementation or verified blocking.

## Mission
Organize DK Live Block into maintainable company-scoped modules. Investigate the advertising technology companies, trackers, analytics providers and attribution services that a platform uses, not merely the platform's visible ad labels. Develop reusable **browser-side** countermeasures so a technique found in one company module can protect other sites using the same advertising provider.

## Scope
- **Meta module (first priority):** Facebook, Instagram, Threads and relevant WhatsApp advertising surfaces. Start with Facebook Sponsored feed and right rail, then independent platform adapters. Common ownership is an investigation lead, never proof that advertising code is identical.
- **YouTube module:** preserve already observed working YouTube blocking and its independent engine; organize existing code without changing accepted playback behavior.
- **Provider intelligence:** recognize services shared between company modules by observed hostnames, request types, public scripts, attribution patterns and supported documented ownership relationships. Separate first-party platform origins, advertising providers, analytics, trackers, CDNs, and essential authentication/media endpoints. Do not classify every Meta/Google domain as advertising.
- Future company modules follow the same contracts once the preceding module is validated.

## Planned source architecture (NOT created yet)
```text
src/
  company-modules.js                 # EXISTING: site/company routing registry
  companies/
    meta/                            # PLANNED
      facebook/ instagram/ threads/ whatsapp/
      advertising-signatures/ countermeasures/
    google/
      youtube/
    advertising-providers/
      provider-profiles/ signatures/ countermeasures/
  intelligence/
    observations/ detections/ evaluations/
  core/
    network/ scriptlets/ cosmetics/ adaptive/ ai/
```
Existing Facebook source remains `src/facebook-ads.js` and existing YouTube source remains in `src/youtube-*.js` and related files. Migrate incrementally with tests, not a risky wholesale reorganization.

## Investigation record schema (planned)
- Provider ID, display name, observed domains and evidence of corporate ownership (date/source/confidence).
- Platform/host, ad surface, mechanism (request, response, script, DOM, embedded media, late-rendered label).
- **Minimized** network metadata: destination hostname, request category, timing and disposition, not full personal URLs, payloads, messages, tokens, cookies or account identifiers.
- Behavior/signature, detection strategy version, source and last-verified date.
- Confirmed ad indicators vs weak hints, conflicts with essential site functionality, known false positives.
- Countermeasure type (network filter, limited scriptlet, cosmetic/procedural hide, parameter handling, media-specific protection), scope, reversible rollback, owner exceptions.
- Evidence-driven effectiveness results: confirmed ad blocked, allowed, or unknown; regression notes and stale/retired signals.

## Adaptive detection design
Use independent, bounded detectors for request endpoints, response metadata, DOM structures, accessible/SVG/split labels, late-added content, advertising-specific link attributes and media surfaces. Enable dormant strategies on relevant observed evidence, not blind guesses. Combine corroborating signals; a numeric score or a single shared advertising-looking attribute is insufficient to remove ordinary content. Prefer narrow reversible operations; stop or fall back if false positives rise. Keep local AI a review/classification tool for *unresolved* candidates, never an uncontrolled remote-code executor or independent authority to block arbitrary site content. Require labeled fixtures and actual browser verification before auto-enabling risky rules.

## Investigation workflow
1. Document the actual advertising surface and inspect locally visible requests/DOM/script behavior.
2. Search actively maintained open-source extensions, public filter lists and published scriptlet techniques; evaluate license, recency and maintenance.
3. Identify provider relationships and reusable mechanisms, with evidence rather than inference.
4. Build scoped countermeasures behind platform/provider detection; include exceptions and restoration.
5. Test ad removal alongside normal posts, Messenger/chat, login, media, purchases and navigation.
6. Keep local, user-controlled reports distinguishing measured facts from hypotheses; refresh stale signatures.
7. Promote a shared provider technique only after independent cross-site regression tests.

## Boundaries and owner principles
- The work is defensive and runs on the user's own browser sessions. No intrusion into provider servers, privileged access, third-party accounts, private messaging, credentials or tracking other people.
- No telemetry, acceptable-ads program, compulsory cloud AI, remote runtime engines, or invasive logging.
- No extra Git branches, unapproved UI changes, automatic untested strategies or untested parity/victory claims. GitHub Actions are allowed sparingly for meaningful verification under the Company Bible.
- Preserve successful YouTube/streaming, 1337x/pop-up and login protections. Company modules should be self-contained but share a common engine.
- Local data retention, deletion and per-site/provider user controls are planned, not currently assured by the new registry.

## Current implementation vs aspirations
**Implemented as of Build 243 / v0.3.213:** pure company/platform registry; Facebook recognizer wired through it, existing YouTube engine retained unchanged; earlier scoped scriptlet and Facebook feed detector code. Tests have been added but complete Linux suite/live Firefox validation remain outstanding.
**Not implemented:** full Meta folder tree, Instagram/Threads/WhatsApp adapters, generalized provider intelligence database, cross-platform shared countermeasures, and an autonomous AI-driven strategy activation engine.
**Acceptance gate:** Facebook ads must actually disappear in real Firefox without damaging ordinary features before marking the Facebook milestone complete.

## Current continuation and integration gaps (November 2, 2026)

The repository now includes an active **Facebook-specific mutation fast path** and a catalog of 24 plausible Meta advertising-delivery methods. The three canonical named Nesty specialists and their eleven backward-compatible method IDs are already registered. Current read-only Meta provider observations record bounded destination hostnames and allowed/blocked counts when the owner enables request logging; these observations **do not prove vendor ownership or ad delivery**.

**Not yet completed:** a persistent evidence-backed company/provider profile database, an automatically validated cross-company reusable strategy, independently confirmed Instagram/Threads/WhatsApp ad handling, a measured forecast model trained on real ad-delivery changes, and fully coordinated local Nesty AI/dispatcher integration. A standalone future-company-intelligence draft is not runtime integration or a verified detector.

**Next controlled sequence:** make one evidence taxonomy → map it to each company/platform profile and an accountable Nesty specialist → observe candidate techniques without altering content → compare against advertiser/provider fingerprints with public evidence and dated verification → test actual strategy in isolation → protect safe organic content → enable only bounded, reversible rules under the proven engine. Preserve the GraphQL-off default until real schema and Firefox tests justify changing it. New profiles must be linked to current source files, tests and a ledger row.

The authoritative continuation is [Nesty company playbook](NESTY_COMPANY_PLAYBOOK.md); live acceptance stays in [verified-sites ledger](VERIFIED_SITES.md) and detailed [QA](QA_LAB.md). Do not place this engineering material in either public README.
