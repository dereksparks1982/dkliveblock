![DK Live Block neon banner](assets/images/DK%20Live%20Block%20Neon%20Banner.png)

# DK Live Block

**Firefox-first ad and tracker blocker from DK LAB / Elderred Softworks.**

**Official project website:** [DK Live Block on GitHub Pages](https://dereksparks1982.github.io/dkliveblock/) has four separate buttons: Google Drive source ZIP, Google Drive Firefox XPI, GitHub repository, and Patreon. **The source ZIP and unsigned Firefox XPI test package have already been uploaded to Google Drive.** The XPI is not yet signed by Mozilla and is not suitable for permanent installation in standard Firefox. Public download access for the XPI has not been verified; a signed, publicly accessible release package is still pending.

**Build 254 (v0.3.224):** Meta advertising intelligence now includes a documented, review-only matrix of 24 known advertising delivery mechanisms and more robust Facebook post-boundary/short-Ad-label recognition. These changes are source-checked candidates, **not a Facebook acceptance PASS**. The complete matrix is in [Meta delivery methods](docs/META_DELIVERY_MATRIX.md).\n\n**Build 253 (v0.3.223):** The public website now has a separate section linking directly to the Hanafi Learning Deck, Folkhold, Nougat Media Plus, and Capital & Consequence web pages. Facebook's existing DK scanner gained an MIT-inspired fallback for plain Sponsored labels in the right rail. This is a source-checked candidate; the last owner Facebook screenshot still showed ads, and full Firefox acceptance is pending.\n\n> **Availability:** DK Live Block is available to download and use from this GitHub repository. The official Firefox Add-ons listing has not yet been approved by Mozilla. Full compatibility, streaming playback, security review, and feature parity with established blockers still require testing.

## What it does

- **Blocks ads and trackers:** combines a native network-filtering engine with bundled Ghostery technology and configurable filter-list subscriptions, including EasyList and EasyPrivacy. Not every advanced filter syntax is supported.
- **Hides page clutter:** offers cosmetic filtering, a page-only element picker (hides reset on refresh), per-site exceptions, and conservative controls for clearly identified ad slots, cookie prompts, and other distractions.
- **Gives you control:** lets you allowlist sites, add custom filters, inspect blocked and allowed requests, review matched rule information, and apply reversible site-scoped request controls.
- **Shows what happened:** provides a Site Dashboard, Network Monitor and local TXT/JSON diagnostics. **Detailed permitted-request reports** now retain up to 400 individual completed requests per tab with their actual DK allow-decision category, HTTP method, HTTP status and completion time, plus per-host/type count breakdowns. Reports distinguish current manual controls from past events. Full URL paths, query tokens, cookies, headers and request bodies are intentionally excluded to protect private accounts.
- **Warns before phishing-listed websites:** a local warning page shows the exact hostname and source, with an explicit, reversible exact-host proceed choice. Real Firefox acceptance is still pending.
- **Handles unwanted tabs and popups:** includes popup safeguards and tracking-parameter cleanup, with protections intended to preserve legitimate sign-ins, payments, and ordinary links. Coverage is not universal.
- **Compares YouTube diagnostics locally:** an optional A/B lab can contrast saved player-state and filtering counters without uploading browsing data or claiming unverified ad removal.
- **Experiments with streaming-ad filtering:** includes bounded YouTube player-response and page-level protections, observation modes, and playback diagnostics. Results vary, and not every video or streaming provider is supported.
- **Offers optional tools:** includes opt-in cookie rejection, video watch-later features, and Linux companion integrations under development.

## How the controls work

**Automatic filtering.** DK Live Block loads its bundled filtering engine and selected filter subscriptions to identify many advertising and tracking requests. Cosmetic filters and the element picker can clean up leftover ad placements on the page. List coverage changes with the websites and subscriptions; some advanced rule formats are not yet implemented.

**Inspect and adjust.** The Site Dashboard and Network Monitor explain blocked and permitted activity, including available rule evidence. You can pause protection for a website, create site-specific exceptions, selectively allow or block eligible destinations, or write custom filters. Changes are meant to remain reversible rather than silently disabling protection everywhere.

**Private local diagnostics.** Optional TXT and JSON exports help troubleshoot site problems and playback. Reports deliberately omit full request URLs, query strings, cookies, headers and message bodies. A blocked request is not proof that an advertisement was removed or that a destination is malicious.

**Video and streaming.** YouTube and other streaming sites are active compatibility targets, with bounded page/player helpers and playback checks. Ad delivery varies by service, content and account. A working video does not automatically prove every ad was blocked, and filtering must not break the stream.

**More technical detail** is maintained in [engineering state](docs/STATE.md), [the feature and parity checklist](docs/ABP_PARITY_CHECKLIST.md), and [real-browser test records](docs/QA_LAB.md).

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
- [Firefox publishing requirements](docs/FIREFOX_MARKETPLACE.md)
- [AMO source/reviewer notes](docs/AMO_REVIEWER_NOTES.md)
- [Release-week plan and acceptance gates](docs/RELEASE_WEEK_2026-11-01.md)
- [Support and bug reporting](SUPPORT.md)

## Support

**Support development (optional):** [DK Live Block on Patreon](https://www.patreon.com/c/dkliveblock). Donations are voluntary, and all features remain free for everyone.

**Find the source:** The Firefox toolbar popup and Settings → Help link directly to the [official GitHub repository](https://github.com/dereksparks1982/dkliveblock). Firefox's add-on details can use the same homepage. These links are optional and do not send browsing diagnostics.

**Bug reports and feature requests:** [elderredsoftworks@proton.me](mailto:elderredsoftworks@proton.me). The extension's Report a Problem feature prepares a draft for review; it never sends a report automatically. Please remove private URLs, tokens, and other sensitive information from any attached diagnostics.

## License

**Free for individuals and companies to use. Not for sale or commercial exploitation.** Nobody may sell DK Live Block, charge for access, repackage it as a paid product, or profit from DK Live Block or modified versions without written permission from Elderred Softworks LLC / DK LAB. Companies may use it internally, including for ordinary business operations. See [LICENSE](LICENSE).
