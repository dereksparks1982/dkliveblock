# DK Live Block

**Firefox-first ad and tracker blocker from DK LAB / Elderred Softworks.**

> **Development status:** DK Live Block is unreleased source code. Firefox compatibility, streaming playback, security review, and feature parity with established blockers still require testing. It is not a finished or Mozilla-signed public release.

> **Target:** An owner-approved Firefox Add-ons submission by **Friday, November 6, 2026**, subject to passing local and Firefox acceptance. **Mozilla review/public listing by November 7 is not guaranteed.** See [the release-week plan](docs/RELEASE_WEEK_2026-11-01.md) and [the store listing draft](docs/AMO_LISTING_DRAFT.md).\n\n## What it does

- **Blocks ads and trackers:** combines a native network-filtering engine with bundled Ghostery technology and configurable filter-list subscriptions, including EasyList and EasyPrivacy. Not every advanced filter syntax is supported.
- **Hides page clutter:** offers cosmetic filtering, an element picker, per-site exceptions, and conservative controls for clearly identified ad slots, cookie prompts, and other distractions.
- **Gives you control:** lets you allowlist sites, add custom filters, inspect blocked and allowed requests, review matched rule information, and apply reversible site-scoped request controls.
- **Shows what happened:** provides a Site Dashboard, Network Monitor and local TXT/JSON diagnostics. **Detailed permitted-request reports** now retain up to 400 individual completed requests per tab with their actual DK allow-decision category, HTTP method, HTTP status and completion time, plus per-host/type count breakdowns. Reports distinguish current manual controls from past events. Full URL paths, query tokens, cookies, headers and request bodies are intentionally excluded to protect private accounts.
- **Warns before phishing-listed websites:** a local warning page shows the exact hostname and source, with an explicit, reversible exact-host proceed choice. Real Firefox acceptance is still pending.
- **Handles unwanted tabs and popups:** includes popup safeguards and tracking-parameter cleanup, with protections intended to preserve legitimate sign-ins, payments, and ordinary links. Coverage is not universal.
- **Compares YouTube diagnostics locally:** an optional A/B lab can contrast saved player-state and filtering counters without uploading browsing data or claiming unverified ad removal.
- **Experiments with streaming-ad filtering:** includes bounded YouTube player-response and page-level protections, observation modes, and playback diagnostics. Results vary, and not every video or streaming provider is supported.
- **Offers optional tools:** includes opt-in cookie rejection, video watch-later features, and Linux companion integrations under development.

## Successful real-world Firefox tests (November 1, 2026)

**DK Live Block has successfully blocked advertising in the project owner's live Firefox testing:**

- **YouTube regular videos:** the owner observed regular video advertisements being blocked during playback.
- **YouTube "Free with Ads" movies:** the owner observed movie advertisements being blocked during playback.
- **Disney+ movies:** the owner reported that advertisements appeared to be blocked while watching a movie. The movie-session export recorded **20 blocked requests**, including an EasyList block against `us-east-2.ads.digital.disneyadvertising.com`.
- **Disney+, CSI: Las Vegas:** the owner observed successful ad blocking while watching the program. A separate playback-session export recorded **22 blocked requests**, including the same Disney advertising hostname.
- **1337x:** the owner observed unwanted advertising popups/new-tab focus takeovers prevented. A separate export recorded **17 blocked requests** on a 1337x mirror.
- **The Pirate Bay (`thepiratebay.org`):** the owner observed that turning on DK Live Block prevented unwanted advertising windows/new tabs from opening and removed small visible advertising placements that appeared with protection off. A Firefox blocked-request export recorded **9 blocked requests** (**7 EasyList**, **2 EasyPrivacy**) while a separate permitted-request export recorded **7 completed requests** in **5 site/destination/type groups**. These are separate observations; the network log does not identify which popup guard prevented window opening.

The Disney+ logged-in landing-page check separately recorded **49 blocked requests**; it is not being presented as a movie test. **These are positive user-observed browser outcomes**, supported where available by sanitized network-filter reports. A blocked request alone does not prove that a video ad was suppressed, and results do not guarantee coverage for every title, session, browser or site. Full regression testing, competitor parity assessment and public-release approval are still pending. See [the detailed real-world QA record](docs/QA_LAB.md).

## Project principles

- No Acceptable Ads program, sponsored placements, promotional ads, paid feature gates, or forced telemetry.
- Ordinary users should not need to install Node.js, Python, or a separate filtering engine. The extension bundles its filtering code; subscriptions can still contact their list providers for updates.
- Keep user choices visible and reversible. Preserve legitimate website functions rather than blindly blocking every request.
- Do not execute JavaScript supplied by remote filter subscriptions.

## Development and testing

DK Live Block is developed primarily on Linux for Firefox. Developers can load the unpacked extension through Firefox's **about:debugging → This Firefox → Load Temporary Add-on** and select `src/manifest.json`.

Run the local regression suite with `bash scripts/test-local.sh`. An optional manual QA lab is available with `python3 scripts/qa-lab.py`. Offline checks do not replace real-browser testing.

**Current limitations:** Advanced rule compatibility, malicious-site navigation protection, broad popup coverage, long-session performance, and dependable YouTube/Disney+ behavior remain works in progress. Video ads may be inserted server-side; some protected streams cannot be modified by an extension. Optional proxy features are not an anonymity guarantee.

## Documentation

- [Development history and release notes](docs/CHANGELOG.md)
- [Current engineering state](docs/STATE.md)
- [Roadmap and acceptance requirements](docs/ROADMAP.md)
- [Feature comparison with Adblock Plus](docs/ABP_PARITY_CHECKLIST.md)
- [Manual browser QA lab](docs/QA_LAB.md)
- [Firefox publishing requirements](docs/FIREFOX_MARKETPLACE.md)\n- [AMO source/reviewer notes](docs/AMO_REVIEWER_NOTES.md)\n- [Release-week plan and acceptance gates](docs/RELEASE_WEEK_2026-11-01.md)
- [Support and bug reporting](SUPPORT.md)

## Support

**Bug reports and feature requests:** [elderredsoftworks@proton.me](mailto:elderredsoftworks@proton.me). The extension's Report a Problem feature prepares a draft for review; it never sends a report automatically. Please remove private URLs, tokens, and other sensitive information from any attached diagnostics.

## License

**Free for individuals and companies to use. Not for sale or commercial exploitation.** Nobody may sell DK Live Block, charge for access, repackage it as a paid product, or profit from DK Live Block or modified versions without written permission from Elderred Softworks LLC / DK LAB. Companies may use it internally, including for ordinary business operations. See [LICENSE](LICENSE).
