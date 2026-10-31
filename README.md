# DK Live Block

**Firefox-first ad and tracker blocker by DK LAB / Elderred Softworks.**

**Unreleased development source: 0.3.90, Build 120.** Firefox testing, YouTube/Disney+ playback and full Adblock Plus equivalence have not yet passed the required acceptance checks.

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

## Development status

**Complete offline test inventory:** The local runner now lists all 110 JavaScript test files, including the six YouTube/redirect suites added in Builds 73–83. Those tests have not been run against the complete checkout in this development session. Firefox playback acceptance remains outstanding.


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
