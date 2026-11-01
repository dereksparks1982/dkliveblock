# DK Live Block

**Firefox-first ad and tracker blocker from DK LAB / Elderred Softworks.**

> **Development status:** DK Live Block is unreleased source code. Firefox compatibility, streaming playback, security review, and feature parity with established blockers still require testing. It is not a finished or Mozilla-signed public release.

## What it does

- **Blocks ads and trackers:** combines a native network-filtering engine with bundled Ghostery technology and configurable filter-list subscriptions, including EasyList and EasyPrivacy. Not every advanced filter syntax is supported.
- **Hides page clutter:** offers cosmetic filtering, an element picker, per-site exceptions, and conservative controls for clearly identified ad slots, cookie prompts, and other distractions.
- **Gives you control:** lets you allowlist sites, add custom filters, inspect blocked and allowed requests, review matched rule information, and apply reversible site-scoped request controls.
- **Shows what happened:** provides a Site Dashboard, Network Monitor, request counts, and local TXT/JSON diagnostics. Reports distinguish historical events from current manual allowances or blocks.
- **Handles unwanted tabs and popups:** includes popup safeguards and tracking-parameter cleanup, with protections intended to preserve legitimate sign-ins, payments, and ordinary links. Coverage is not universal.
- **Experiments with streaming-ad filtering:** includes bounded YouTube player-response and page-level protections, observation modes, and playback diagnostics. Results vary, and not every video or streaming provider is supported.
- **Offers optional tools:** includes opt-in cookie rejection, video watch-later features, and Linux companion integrations under development.

## Project principles

- No Acceptable Ads program, sponsored placements, promotional ads, paid feature gates, or forced telemetry.
- Ordinary users should not need to install Node.js, Python, or a separate filtering engine. The extension bundles its filtering code; subscriptions can still contact their list providers for updates.
- Keep user choices visible and reversible. Preserve legitimate website functions rather than blindly blocking every request.
- Do not execute JavaScript supplied by remote filter subscriptions.

## Development and testing

DK Live Block is developed primarily on Linux for Firefox. Developers can load the unpacked extension through Firefox's **about:debugging → This Firefox → Load Temporary Add-on** and select `src/manifest.json`.

Run the local regression suite with `bash scripts/test-local.sh`. An optional manual QA lab is available with `python3 scripts/qa-lab.py`. Offline checks do not replace real-browser testing.

**Current limitations:** Advanced rule compatibility, malicious-site navigation protection, broad popup coverage, long-session performance, and dependable YouTube/Disney+ behavior remain works in progress. Video ads may be inserted server-side; some protected streams cannot be modified by an extension. Optional proxy features are not an anonymity guarantee.

No GitHub Actions, hosted build runners, automatic releases, or public downloads are authorized for this project.

## Documentation

- [Development history and release notes](docs/CHANGELOG.md)
- [Current engineering state](docs/STATE.md)
- [Roadmap and acceptance requirements](docs/ROADMAP.md)
- [Feature comparison with Adblock Plus](docs/ABP_PARITY_CHECKLIST.md)
- [Manual browser QA lab](docs/QA_LAB.md)
- [Firefox publishing requirements](docs/FIREFOX_MARKETPLACE.md)
- [Support and bug reporting](SUPPORT.md)

## Support

**Bug reports and feature requests:** [elderredsoftworks@proton.me](mailto:elderredsoftworks@proton.me). The extension's Report a Problem feature prepares a draft for review; it never sends a report automatically. Please remove private URLs, tokens, and other sensitive information from any attached diagnostics.

## License

Original application source is currently MIT licensed. Bundled Ghostery and Mozilla Public Suffix List components use MPL-2.0, and third-party filter lists have their own license terms. A future licensing decision cannot revoke rights already granted under MIT.
