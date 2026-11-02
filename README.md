![DK Live Block neon banner](assets/images/DK%20Live%20Block%20Neon%20Banner.png)

# DK Live Block

**Firefox-first ad and tracker blocker from DK LAB / Elderred Softworks.**

**Official project website:** [DK Live Block on GitHub Pages](https://dereksparks1982.github.io/dkliveblock/) has four separate buttons: Google Drive source ZIP, Google Drive Firefox XPI, GitHub repository, and Patreon. **The source ZIP and unsigned Firefox XPI test package have already been uploaded to Google Drive.** The XPI is not yet signed by Mozilla and is not suitable for permanent installation in standard Firefox. Public download access for the XPI has not been verified; a signed, publicly accessible release package is still pending.

**Build 274 / v0.3.244 (unreleased):** Agent Nesty 5 now detects a second XNXX popunder: a verified video child followed by a rapid foreign redirect in the original tab. Agent Nesty 4 also recovers late browser opener identity. This is behavior-based, not advertiser-domain-based; unrelated navigation and video playback are protected by explicit evidence guards. New test cases added. Full Linux and browser acceptance pending. [Build 274](docs/BUILD_274.md).

**Build 273 / v0.3.243 (unreleased):** **Agent Nesty 4** tracks XNXX source-linked popup tabs and delayed foreign redirects through Firefox tab creation, navigation-target, URL-change and main-frame request events. It cancels confirmed unwanted foreign navigation and closes the tab, while preserving same-site videos, known login windows, user pauses, and one-time permissions. No advertiser domain list required. Synthetic tests added; **live Firefox acceptance remains pending**. [Build 273 notes](docs/BUILD_273.md).

**Build 272 / v0.3.242 (unreleased):** Orion's experimental pause now rejects malformed saved site entries and stale startup reads, preserves a paused state on storage errors, and cannot restart scanners during page-cache suspension. Agent Nesty Meta 06 catches bounded Sponsored-label style changes on external referenced spans/SVG nodes, without widening Facebook's whole-post hiding rules. A focused regression file has been added. No new permissions, website geometry changes, or active GraphQL filtering. **Real Orion and Facebook browser acceptance remains pending.** [Build 272 notes](docs/BUILD_272.md).

**Build 271 / v0.3.241 (unreleased):** Facebook's experimental GraphQL transport now rejects malformed nested RequireJS, __bbox and result fields as an entire transaction, protecting earlier valid records from partial edits. Seven new regression cases were added, but are not yet executed in the full Ubuntu suite. The filter remains OFF by default and no live Facebook/Orion success is claimed. [Build 271 details](docs/BUILD_271.md).\n\n**Build 270 / v0.3.240 (unreleased):** Agent Nesty Meta 05 extends Facebook GraphQL protection with fail-open nested RequireJS/JSONL error handling and bounded traversal; 15 adversarial synthetic cases passed. This is still experimental and OFF by default until real Firefox acceptance. [Build 270 details](docs/BUILD_270.md).

**Build 269 / v0.3.239 (unreleased):** Agent Nesty Meta 04 prevents indefinitely cached Facebook Sponsored labels from misclassifying React-recycled ordinary posts. Orion's separate Pause/Resume now checks the active site's hostname and treats malformed saved preferences safely. Website geometry and Firefox permissions unchanged. [Build 269 notes](docs/BUILD_269.md).

**Build 268 / v0.3.238 (unreleased):** Orion iPhone/Mac test candidate now has a dedicated exact-site Pause/Resume control, with bounded local host-only saves where supported. Still DOM-only and not yet device-verified. [Build 268 details](docs/BUILD_268.md).

**Build 267 / v0.3.237 (unreleased):** Orion and Firefox Facebook observers now handle bounded React update bursts without dropping later Sponsored-label changes; Orion also protects page-cache timers and resumes scanning on foreground. Eleven focused simulated lifecycle checks passed; real browser verification and the complete Ubuntu suite are still required. [Build 267 details](docs/BUILD_267.md).

**Build 266 / v0.3.236 (unreleased):** Three bounded Agent Nesty Meta detectors are integrated into our existing Facebook recognizer for short fragmented Sponsored labels, explicit menu wording and mutation-driven rescans. The offline Linux runner now registers all 169 Node test files after repairing 29 omissions; 11 new simulated cases passed, but a full Ubuntu run and real Facebook/Orion verification are still required. The Facebook GraphQL response filter remains OFF by default. [Build 266 notes](docs/BUILD_266.md).

**Orion cross-device experiments (not released):** DK's existing site-level ad recognizers now have a separate DOM-only Orion package builder for iPhone/iPad and Mac targets. This is an experimental, deliberately incomplete compatibility preview: no network blocking, no filter-list engine, and no proven Orion iPhone installation. Desktop Firefox stays unchanged. See [Orion compatibility and limitation matrix](docs/ORION_COMPATIBILITY.md).

**Website iPhone and desktop polish (extension version unchanged):** The 'Core Protections' and 'Guides, updates & projects' section headings are shown, but both extra instructional paragraphs are removed. All twelve card headings now have an internal divider; 44px cyan close buttons use properly centered vector X icons. Original hero button dimensions are unchanged, with larger XPI artwork/text and consistent-color GitHub/Patreon SVG marks/labels. Both Pages layouts include a local Apple touch icon from the approved DK emblem and an installable-web-app manifest. iPhone Firefox may still choose its own fallback icon. See [website details](docs/WEBSITE_EDUCATION_HUB.md).

**Website sound & controls (extension version unchanged):** Bundled “Button Press” sound by DRAGON-STUDIO (Pixabay) now accompanies deliberate website button/card clicks, with [asset attribution](docs/ATTRIBUTIONS.md). All twelve modal headers use a cyan **×** close control with a 44px touch target; short panels have no redundant “Back to top.” Website mirrors stay synchronized. [Website details](docs/WEBSITE_EDUCATION_HUB.md).

**Website learning hub update (same extension version):** The public page now has two sets of six fully clickable cards. The first set teaches ad blocking, popups, request evidence, user controls, ad delivery and cookies; the second opens the original status, installation, downloads, license, support and project-link information. All details and all three approved project links are preserved in accessible dialogs. [Website design notes](docs/WEBSITE_EDUCATION_HUB.md).

**Build 265 (v0.3.235):** Continued Facebook protection work with fail-safe GraphQL streaming: multi-record JSONL edits are now atomic, unknown/malformed/auth-error records preserve the *whole* response, idle timeouts reset on incoming data, and total stream time and chunk count remain bounded. Expanded the existing Facebook right-rail scanner to recognize accessible Sponsored buttons without touching Contacts. **34 focused JavaScript tests passed** across Builds 263–265; full Linux suite and live Firefox confirmation are still pending. GraphQL response editing remains **off by default**. [Build 265](docs/BUILD_265.md).

**Build 264 (v0.3.234):** Extended the opt-in Facebook GraphQL/JSONL filter with explicitly sponsored Marketplace feed edges, nested `__bbox` response envelopes, and stricter ad markers for right-rail units; fixed the character-split Sponsored sidebar label scanner. **20 focused isolated JavaScript tests passed** across Builds 263 and 264. GraphQL remains **OFF by default** because full Ubuntu tests and live Firefox/Meta schema verification are not complete. [Build 264 engineering notes](docs/BUILD_264.md).

**Build 263 (v0.3.233):** Added a separate, off-by-default Facebook GraphQL response filter for confirmed Sponsored records, local counters, and a Settings switch. The three website project links are now matching bottom-aligned buttons. Full Firefox and Ubuntu test acceptance remain pending. [Build details](docs/BUILD_263.md).

**Build 262 (v0.3.232):** Further integrated the MIT Facebook blocker techniques into DK's own scanner, adding bounded nested Sponsored-label reconstruction, safeguards against hiding multiple sibling posts, and delayed restoration of recycled ordinary posts. Synced manifest/package versions and fixed historical regression tests. **13 isolated JS scenarios passed**, but the full Linux suite and live Firefox acceptance remain pending. See [Build 262](docs/BUILD_262.md).

**Build 261 (v0.3.231):** Completed a wider, *targeted* MIT-inspired Facebook DOM integration in DK's existing detector: individual Marketplace sponsored tiles, mobile/virtualized feed posts, short-lived Sponsored-label recovery, and safer header/grid boundaries. Seven focused JavaScript regression cases passed; **live Firefox Facebook acceptance and full Node suite are not yet complete**. Also removed Nougat Media Plus from DK's website project cards, leaving three links. [Build details](docs/BUILD_261.md).

**Build 260 (v0.3.230):** Three concrete Facebook detection problems are addressed: split-character labels skipped before decoding, right-rail sponsored links failing to traverse ad containers, and generic-hide exceptions disabling the Facebook-specific recognizer. The Meta Intelligence viewer now includes **local Facebook detector diagnostics** with count-only JSON export, making the next Firefox acceptance test actionable. Isolated synthetic cases passed; **live Facebook verification is still pending**. See [Build 260](docs/BUILD_260.md).

**Build 259 (v0.3.229):** DK Live Block now has its **first Russian-language interface** in the Firefox popup and Settings. Select **Русский** or English; the preference survives browser restarts and does not affect filter-list languages. Russian coverage is partial with English fallback; Arabic, Turkish, Urdu and Persian/Farsi are future targets. See [interface languages](docs/UI_LANGUAGES.md). Live Firefox and translation acceptance are still pending.

**Build 258 (v0.3.228):** The new event-driven cookie watchers are named **Agent Nesty**, with numbered IDs `agent_nesty_1` (passive HTTP `Set-Cookie` observer), `agent_nesty_2` (unarmed Firefox cookie-change observer), and `agent_nesty_3` (unarmed JavaScript cookie observer). The Cookie Watch page displays their true status from the registry. **No per-cookie enforcement is active yet.** See [Build 258](docs/BUILD_258.md).

**Build 256 (v0.3.226):** Facebook fixes now accept the literal Sponsored menu accessibility label and more carefully select complete single-post containers. A privacy-minimal cookie intelligence/Allow-Block decision model is committed for future opt-in per-cookie controls, but **cookie enforcement and GUI toggles are not active yet**. See [Cookie Intelligence](docs/COOKIE_INTELLIGENCE.md). Facebook live acceptance remains pending.\n\n**Build 254 (v0.3.224):** Meta advertising intelligence now includes a documented, review-only matrix of 24 known advertising delivery mechanisms and more robust Facebook post-boundary/short-Ad-label recognition. These changes are source-checked candidates, **not a Facebook acceptance PASS**. The complete matrix is in [Meta delivery methods](docs/META_DELIVERY_MATRIX.md).\n\n**Build 253 (v0.3.223):** The public website now has a separate section linking directly to the Hanafi Learning Deck, Folkhold, Nougat Media Plus, and Capital & Consequence web pages. Facebook's existing DK scanner gained an MIT-inspired fallback for plain Sponsored labels in the right rail. This is a source-checked candidate; the last owner Facebook screenshot still showed ads, and full Firefox acceptance is pending.\n\n> **Availability:** DK Live Block is available to download and use from this GitHub repository. The official Firefox Add-ons listing has not yet been approved by Mozilla. Full compatibility, streaming playback, security review, and feature parity with established blockers still require testing.

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
- [Third-party asset and source attributions](docs/ATTRIBUTIONS.md)
- [Current continuation handoff](docs/CONTINUATION_HANDOFF.md)

## Support

**Support development (optional):** [DK Live Block on Patreon](https://www.patreon.com/c/dkliveblock). Donations are voluntary, and all features remain free for everyone.

**Find the source:** The Firefox toolbar popup and Settings → Help link directly to the [official GitHub repository](https://github.com/dereksparks1982/dkliveblock). Firefox's add-on details can use the same homepage. These links are optional and do not send browsing diagnostics.

**Bug reports and feature requests:** [elderredsoftworks@proton.me](mailto:elderredsoftworks@proton.me). The extension's Report a Problem feature prepares a draft for review; it never sends a report automatically. Please remove private URLs, tokens, and other sensitive information from any attached diagnostics.

## License

**Free for individuals and companies to use. Not for sale or commercial exploitation.** Nobody may sell DK Live Block, charge for access, repackage it as a paid product, or profit from DK Live Block or modified versions without written permission from Elderred Softworks LLC / DK LAB. Companies may use it internally, including for ordinary business operations. See [LICENSE](LICENSE).
