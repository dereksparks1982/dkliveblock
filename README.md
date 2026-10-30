# DK Live Block

**UNRELEASED source code, current development version 0.3.22 (Build 51).** A Firefox-first ad and tracker blocker being developed by DK LAB / Elderred Softworks. No subscriptions, accounts, "acceptable ads" exemptions, telemetry, or premium-only features.

DK Live Block is **not yet equivalent to Adblock Plus**. Priorities include general automatic ad detection and video-site compatibility, especially YouTube and Disney+. Real Firefox playback behavior still needs verification. Server-inserted advertisements and DRM can limit what a browser extension can remove.

One main branch, rapid source development and fixes as problems are found. No public release until the extension is ready.

DK Live Block application code is MIT-licensed; the locally bundled Ghostery filtering engine and Mozilla Public Suffix List components are MPL-2.0 (see `src/LICENSE-PSL.txt` and `vendor/public_suffix_list.dat`). External filter subscriptions have their own licenses. No ABP application code is copied.

The **Ghostery filtering engine is included in this repository and loads with the extension**. Firefox users will not need Node.js, npm, Ghostery installation, a second download, or a separate account. The current code remains unreleased pending real Firefox validation.

Developers may run optional offline checks with: bash scripts/test-local.sh

Developer loading, once all extension files are present: Firefox about:debugging#/runtime/this-firefox, Load Temporary Add-on, select src/manifest.json. A temporary extension is removed when Firefox restarts.

See docs/ROADMAP.md for the acceptance checklist.

## Build 51: per-website cookie and distraction controls (0.3.22)

The Firefox toolbar now offers independent, persistent **Disable cookie rejection here** and **Disable distraction cleanup here** controls. These are **not** complete site allowlisting: ad/tracker request blocking, security and custom filtering remain active. The Settings page lists every site-specific cleanup exception and provides individual removal controls. A parent hostname affects subdomains; resuming from a subdomain clears covering parent exceptions. The background checks the actual live HTTP(S) tab rather than trusting the caller's supplied URL. All new settings are validated and restored safely after Firefox restarts. This is source implementation, not completed live Firefox acceptance testing.

## Build 50: Firefox-native notification permission blocking (0.3.21)

DK Live Block uses Firefox's own `browserSettings.webNotificationsDisabled` API, with a declared browser-settings permission, to deny new website notification permission prompts by default. The feature has a visible Settings toggle and actual control-status reporting. Previously granted per-site notification permissions remain effective. Disabling the protection **clears only DK Live Block's global override**, rather than overwriting user settings or another extension's preferences. No site scripts or promotional notifications are used. Real Firefox testing is outstanding.

## Build 49: opt-in element-hiding debugger (0.3.20)

A new **Inspect element-hiding filters** toolbar action opens a dedicated, local extension page. Users can scan the first 80 eligible cosmetic selectors for the original protected site, inspect selector-level match counts and temporarily outline up to 12 visible matches. Clear restores previous inline outline styles without changing display, hiding, scroll, video playback, filter rules or permissions. No page contents or full page URLs are captured. Real Firefox acceptance and CSS selector provenance remain outstanding.

## Build 48: optional regional language filters (0.3.19)

Six supplemental regional subscriptions now cover Arabic, Turkish, Russian, French, German and Chinese-language sites. All six remain **off by default**. The Firefox-language recommendation button reads local preferences only after a click, enables up to four matching lists and requests updates. Arabic suggestions also include the required French supplement. A list requires a successful download before it contributes protection. See [source catalog](docs/REGIONAL_FILTERS.md). Live Firefox testing and complete license checks remain pending.

## Build 47: individual filter-list management (0.3.18)

Built-in lists now have independent enable/disable and Update controls, with per-list download state, timestamps and errors. Custom HTTPS subscriptions show their own Refresh and Remove buttons. Individual updates preserve a last-good cached list if download fails, and only saved HTTPS subscriptions can be refreshed. Filter-list changes stay separate from the broader website allowlist. Full live Firefox testing is pending.

## Build 46: Allowed Websites / one-click allowlisting (0.3.17)

The Firefox toolbar now offers **Allowlist this website** and **Remove from allowlist** for the current HTTP(S) site. Allowed websites are saved between restarts and shown in a dedicated **Allowed Websites** Settings section, where users can add a hostname or paste a website URL and revoke individual sites. A stored hostname applies to its subdomains; an unrelated website remains protected. DK Live Block stores **only the canonical hostname**, never private URL paths, passwords or tokens.

This uses the pre-existing `paused` setting internally, so there is **one source of truth**, not competing whitelist systems. An advanced manual hostname editor remains available, along with individual host/type request exceptions in the Network Monitor. The toolbar clearly warns that a full-site allowance disables blocking for that site, whereas a request allowance is narrow. All allowances are user-initiated, reversible and free. There is no Acceptable Ads or paid whitelist program. Offline source checks are not a substitute for complete Firefox testing.

## Build 45: Advanced Firefox tools and no-promotions policy (0.3.16)

Firefox's toolbar count is now configurable, a **Block element with DK Live Block** right-click command opens our existing visual picker, and an **optional Developer Tools panel** can inspect hostname-level network decisions using on-demand local capture. These are source implementations still awaiting real Firefox acceptance testing; the optional DevTools permission is only requested when explicitly enabled.

A complete [Adblock Plus feature inventory](docs/ABP_FEATURE_INVENTORY.md) now tracks the General and Advanced settings in the supplied screenshots. **No paid Acceptable Ads exemptions, sponsor messages, marketing prompts, upgrade nags or promotional-message toggle will be added.** DK Live Block does not monetize the act of allowing ads. Extra language-list management, native Firefox notification control and an element-hiding debug overlay remain scheduled.

## Build 44: protection-first defaults and conservative distraction removal (0.3.15)

New installations now enable **EasyList advertising, EasyPrivacy tracking, EasyList Cookie, Fanboy Annoyances and Fanboy Social** filtering, plus explicit multilingual **Reject optional cookies** and safe **Newsletter / survey / floating corner-ad overlay protection**. All of these remain free. **There is no Acceptable Ads program, paid allowlist or Premium tier.** Previously saved disabled flags and list choices are preserved. Third-party filter lists still require a successful normal update before their rules apply; if offline, only built-in/local rules provide protection.

Cookie handling never automatically accepts consent. It clicks only a clearly identified reject/necessary-only button inside a verified cookie notice, avoiding hidden, disabled, conflicting-label and sensitive dialogs. The enhanced multilingual labels add conservative Russian, Chinese, Arabic and Welsh support alongside existing English, Turkish and European examples. A selector or translation is not proof that every language/cookie framework is fully supported.

The new automatic distraction detector works only on clearly identified newsletter forms, survey dialogs and floating advertising **containers**. It excludes sensitive security/payment/authentication dialogs, real videos/audio/embedded players, fullscreen content and unrelated in-page text; CSS hiding is reversible. **This is not a general floating-video player suppressor**: videos and their frames are deliberately left alone to avoid breaking legitimate playback. It also cannot disable Firefox's native notification-permission prompt via page DOM handling. Those cases require separate Firefox-specific review.

All core protection starts without an extra install or paid account. Users can turn off individual protections in Settings. No extra runtime dependencies, permissions, telemetry, GitHub Actions or public package were added. Offline full Node/Python and live Firefox validation remain pending.

## Build 43: Disney+ playback compatibility and granular repair (0.3.14)

The **local-only streaming player-health probe** now recognizes real YouTube and Disney+ hostnames. On visible, active streaming pages, it can record coarse HTML5 buffering or media-error events alongside nearby blocked **media-type** requests. It does not capture video names, playback positions, URL paths, license requests, accounts or response bodies. It does **not** access DRM keys or remove server-inserted advertisements. The Settings interface now selects an actual streaming tab rather than whichever ordinary page was used most recently.

When troubleshooting a player, users can examine a blocked hostname and resource type and apply the existing **explicitly confirmed, 10-minute, one-tab exception**, or revoke just that single exception without turning off the blocker. The background independently verifies the live tab hostname and rejects stale evidence from a different streaming website; recorded blocked-request groups now carry their **source site hostname** for isolation. No automatic unblocking, bypassing account/license restrictions, external dependencies, telemetry, additional Firefox permissions or public release.

For the status of premium-equivalent features and the remaining release requirements, see [ABP parity checklist](docs/ABP_PARITY_CHECKLIST.md). **Disney+ playback is not yet verified in live Firefox**, and HTML5 health events may not cover every protected streaming player.

## Build 42: YouTube playback-health diagnostics and evidence-based repair (0.3.13)

DK Live Block can now observe coarse, **local-only** YouTube HTML5 playback-health signals (sustained buffering of at least five seconds and media decode/source/network errors) and show them next to existing blocked streaming requests in Settings. The probe runs from the already existing low-frequency content-script loop only when protection and private request logging are active, the top-level YouTube page is visible, and the player is not paused, seeking, or ended. It never captures video titles, playback progress, media URLs, account details or personal watch history. It is capped, time-limited and reset across navigation.

A health event is marked if a blocked **media-type** request happened nearby, but **correlation is not proof that DK Live Block caused playback problems**. No requests are automatically allowed. The existing 10-minute, exact-host-and-type manual repair requires explicit confirmation and remains reversible; YouTube/Disney+ server-inserted advertising and live playback acceptance have not been validated.

## Build 41: YouTube skip safety, observer performance and regression gates (0.3.12)

The opt-in-compatible YouTube skip assistant is more careful about **which control it clicks**. A dedicated ad-skip CSS class is no longer enough by itself to click arbitrary recycled buttons such as "Learn more", "Next", "Report ad" or "Continue"; a known skip-ad label is required, or a short/empty label together with an actual ad-skip context. The skip assistant also checks computed visibility, zero opacity, pointer-event state and disabled ancestors, as well as existing disabled/hidden checks. Known English-language accessible labels have broader coverage without allowing generic "Skip intro" or "Skip recap" controls.

The YouTube-specific mutation observer now recognizes accessible Skip Ad buttons as relevant even before expected CSS classes appear. Its inserted-node inspection examines at most 12 items by index instead of calling `Array.from` on an arbitrarily large NodeList. The existing low-frequency page-side playback checks already provide a fallback, so no new timer, polling dependency or permission was added.

**Regression review:** 26 YouTube skip-assistant/observer tests plus six local compatibility-pack validator tests passed in a focused JavaScript test harness. This is **not** the complete Node.js/Python suite and **not** live Firefox, YouTube playback, or server-inserted-ad validation. The extension remains unreleased.

## Build 40: conservative automatic ad recognition improvements (0.3.11)

The optional DOM ad recognizer now covers additional **strongly identified ad slots**, including paired ad-unit/ad-slot attributes, explicit advertisement test IDs and standard Google advertising iframe identifiers. It does **not** hide arbitrary `sponsored` articles or page sections based solely on generic words. Additional ancestor protection keeps candidate elements inside articles, sign-in dialogs, player controls and navigation out of this heuristic. The work stays local, reversible, opt-out friendly and does not add browser permissions.

The recognizer now rotates its scan start across large lists of candidate elements, so dynamically inserted advertising lower in the page is not indefinitely missed because the first 120 nodes were scanned repeatedly. Each scan remains bounded to 120 candidates, six newly hidden elements and a maximum of 100 retained hidden entries. This is not a claim that all advertising is automatically recognized; YouTube and Disney+ playback, the complete offline suite, and full ABP parity require separate validation.

## Build 39: popup and popunder activity history (0.3.10)

The Network Monitor now includes **Popup and popunder activity** for the selected tab. With private request logging enabled, each popup DK Live Block **successfully closes** is recorded in a bounded local, memory-only history (up to 100 per tab, two-hour expiry). Entries distinguish strict popunder protections from filter-rule closures and store only the observed **destination hostname**. For blank-first popunders the destination may be **unknown**; a later Firefox navigation-target event can fill it in when available. No raw URL paths, query strings, cookies, developer uploads, new permissions or external dependencies. The user can refresh or clear history.

This records observed closed tabs, **not every attempted popup**, and does not reveal OS-wide computer activity. Full offline regression and live Firefox acceptance remain pending.

## Build 38: Website Access Inspector and individual request controls (0.3.9)

The opt-in Network Monitor now identifies the exact Firefox-observed **resource type**, website-versus-third-party context, and a conservative **possible purpose** for each captured request. Advertising and analytics hints are identified as **Likely**, not presented as proof of spying or device access.

Each blocked entry offers a user-confirmed exception scoped to the **current website, exact destination hostname and exact resource type**, with a choice of **10 minutes in this tab**, **the current browser session**, or **remember for this website**. All exceptions can be revoked. Blocking remains the default, source-site mismatches and invalid hosts/types are rejected, and the permanent exception list is bounded and validated at startup. An allowance is offered only when a currently running capture recorded that blocked host/type. It cannot override strict popup tabs, unrequested redirects or primary document navigation, and it does not allow a whole hostname unrestricted. **This is not a unique-URL allow rule:** repeated requests of the same host/type may pass, even if they have different URL paths. Do not enable unfamiliar trackers or scripts.

All diagnostics remain in memory until the user explicitly exports; only user-chosen permanent exception descriptors (host/type/site, never complete URLs) are stored. No new Firefox permissions, telemetry, external dependencies or public release. Full offline and live Firefox acceptance remains pending.

## Bug Reporting & Support

Found an advertisement DK Live Block missed, an unwanted popup, a website that stopped working, or another problem? **Please report it directly to the developer.**

**Email:** [elderredsoftworks@proton.me](mailto:elderredsoftworks@proton.me)

When reporting a problem, include the **DK Live Block version**, **Firefox version**, **affected website hostname**, a short description of what happened, and steps to reproduce it if possible. Feature requests and suggestions are welcome too.

You can also open **DK Live Block → Report a Problem** in the Firefox toolbar or **Settings → Help and bug reports** to prepare an email draft. The report is **never sent automatically**; you review it and send it yourself. Do not include passwords, authentication tokens, cookies, or private links.

For more details, see [SUPPORT.md](SUPPORT.md). DK Live Block is still under development, so the support inbox does not imply the extension has been publicly released.

## Build 37: official bug reporting and support contact (0.3.8)

DK Live Block's official developer-support inbox is **elderredsoftworks@proton.me**. Firefox toolbar and Settings now link to an opt-in **Report a Problem** page, with categories for bugs, missed ads, broken websites, unwanted popups/redirects, feature requests and other feedback. It prepares a local, reviewable email draft including only user-entered text, an optional sanitized **hostname** (never the full URL or its private tokens) and DK Live Block's version. No report is sent automatically, no diagnostic log is attached, and there is no tracking, account or new permission. Users can copy the draft instead of opening an email application. The official Mozilla Add-ons support field should use the same address **only when the extension is approved for public release**.

## Build 36: aggressive unsolicited new-tab/popunder defense (0.3.7)

Strict popunder protection is **on by default** for The Pirate Bay and 1337x-style hostnames. It closes all newly created tabs/windows attributed to these source sites by Firefox's tab-opener and navigation-target events, even when they begin as `about:blank` or use unpredictable ad-server domains. The existing blocking-request badge counts successful closures as blocked attempts. Browser `webRequest` cancels main-frame loading in identified unwanted tabs while the tab closes.

There is one explicit exception: **Allow next new tab (15 seconds)** from the DK Live Block toolbar. It permits a single new tab from the current protected site and expires automatically; otherwise deliberate Ctrl-click or `target=_blank` navigation from those sites may be blocked along with popunders. Normal same-tab navigation and `magnet:` external-handler links are not targeted. Settings can disable strict mode while retaining ordinary rule-based popup filtering. No blanket whitelisting, external dependencies or new permissions. **Live Firefox tests remain outstanding, so no absolute 100% guarantee is claimed.**

## Build 35: private network traffic monitor and blocked-request badge (0.3.6)

A new **Network Monitor** opens from the Firefox toolbar or Settings. Select a website tab and click **Start capture** to see individual requests with their allowed, blocked, redirected, failed or pending status. Filter by decision, resource type or hostname, and export an explicitly requested local CSV. Captures belong to one tab and site, stay in memory, and retain up to 1,500 recent requests with a visible dropped-row count. Request bodies, full URL paths, query parameters, cookies, authorization headers and response contents are never recorded. Capture stops on request or when navigating to another site, and ad blocking works normally with the monitor off.

The existing browser-action badge remains independent from capture and counts blocked requests for the current tab. Its color is now red with white text; large counts display a capped `9999+`. The badge resets on navigation/reload. Only Firefox-observed requests are visible, not OS-wide Linux traffic. The extension remains unreleased, and actual Firefox testing is outstanding.

## Build 34: conservative site-scoped cosmetic filter aliases (0.3.5)

The procedural filter parser recognizes **`:has-text(...)`**, **`:-abp-has-text(...)`**, and **`:has(...)`** aliases alongside the existing `:-abp-contains(...)` and `:-abp-has(...)` forms, **only for explicitly site-scoped `#?#` rules**. These map to the existing bounded, non-executable text and descendant predicates, with site-specific exceptions and player/auth safeguards unchanged. Malformed script-like or multi-action expressions remain rejected. Focused regression tests were added.

This is limited cosmetic compatibility work, not scriptlet support or full Adblock Plus parity. No remote executable code, new permissions or public releases.

## Build 33: user-confirmed temporary streaming repair (0.3.4)

The Streaming playback diagnostics section now offers **Try allow host/type (10 min)** only for a hostname and resource type actually observed blocked on that YouTube/Disney+ tab. A confirmation warns that this could allow ads. The allowance is restricted to the exact tab, streaming site, hostname and media/XHR/other request type, capped at ten entries and never persisted. It expires after ten minutes or is revoked from settings, on leaving the streaming site, tab closure, log disable or statistics reset. The toolbar warns whenever a temporary streaming repair is active.

This is **not** automatic ad bypass, a proof of a video false-positive or a public release. Actual Firefox streaming acceptance is still outstanding.

## Build 32: My Downloads local file inventory (0.3.3)

The Firefox toolbar now links to **My Downloads**, a read-only list of media files saved under `~/.local/share/dk-live-block/downloads/`. A user clicks **Scan My Downloads** to request the optional Linux native-messaging permission and inspect up to 150 local media files. The companion returns only sanitized filenames, sizes and modified times, never reads media contents, never follows symlinks and never accepts file paths supplied by websites or the browser. Hidden, partial and non-media files are not listed. Nothing is executed or deleted.

The optional native companion installers now bundle the read-only `download_library.py` module. Baseline ad blocking and the watch-later library remain entirely independent of the companion. **Unreleased, actual Firefox integration not yet verified.**

## Build 31: private streaming playback diagnostics (0.3.2)

A new **Streaming playback diagnostics** settings section displays recent request-block groups on YouTube and Disney+, using only hostnames, request types, counts and times in a bounded in-memory store. These are **potential troubleshooting clues**, not proof of an actual playback failure. Data is kept only if temporary request logging is enabled and is never uploaded; disabling logs or clearing the tab removes the records. The toolbar has an Inspect shortcut when a supported streaming site is open. No request is automatically allowed, and ordinary ad blocking is unchanged.

The feature is not a substitute for real Firefox YouTube preroll/midroll and Disney+ playback tests, which remain required.

## Build 30: erase viewing history and disable automatic remembering (0.3.1)

The saved-video library now has an explicit **Erase saved-video history** action that removes saved video records and the last download status, switches off automatic remembering, and clears local report cooldowns. A confirmation explains precisely what will be erased. Downloaded video files are **not** deleted. An active native download must finish or be cancelled first. The library displays whether automatic remembering is enabled.

The operation is serialized behind existing local library writes to prevent immediately reappearing records. No external service, mandatory dependency or extra Firefox permission.

## Build 29: organized video library with favorites and notes (0.3.0)

The local video library now supports **Favorites**, **Watched/Unwatched**, short private video notes (500 characters), and filters for unfinished/watched/favorite videos. Search also covers notes. Normal local saves and opt-in automatic memory updates preserve your labels and notes rather than resetting them. JSON backups include this metadata with the existing strict validation and 300-entry cap. No telemetry, accounts, or new Firefox permissions.

This is an unreleased source development milestone. Full Firefox and streaming acceptance remain outstanding.

## Build 28: optional automatic remembrance of unfinished YouTube videos (0.2.9)

Settings → Video and cookies now offers **Remember unfinished YouTube videos automatically**, **OFF by default**. When explicitly enabled, the top-level YouTube content script can report a regular video after at least 60 seconds of actual HTML5 playback, not during ad breaks, and rate limits updates to once per 30 seconds. The background independently verifies the tab and sender's YouTube video ID, frame, position and duration before storing it in the existing private 300-video library. Nothing is synced or sent to DK servers. Turning the option off stops new automatic saves; saved entries are controlled separately in My Saved Videos.

Baseline ad blocking, yt-dlp installation, and download quality controls remain unchanged. The project is unreleased; real Firefox YouTube and Disney+ tests are still mandatory.

## Build 27: interrupted download recovery and processing phases (0.2.8)

The optional yt-dlp command now enables explicit partial-file resume on a user-requested retry, while preserving no-overwrite protection. The toolbar identifies interrupted, cancelled or failed jobs and labels the next action **Retry Download**; it does not retry without user approval. Coarse job state (video ID, quality, progress and status) is retained locally so a Firefox restart can classify a prior running job as **interrupted**. During FFmpeg merging or audio processing, the popup reports that stage instead of suggesting the transfer has hung. No filenames or raw yt-dlp logs are forwarded to Firefox.

No user-installed dependencies were modified. This remains an unreleased source build with actual end-to-end Firefox acceptance outstanding.

## Build 26: searchable local video library and backups (0.2.7)

The saved-video library now supports **search, sort, JSON export/import, and explicit Clear Library** in addition to the existing Resume and Remove actions. Backups are local, capped and strictly validated. Imports merge with existing entries, discard duplicate video IDs and preserve the 300-video library limit. No new permissions, accounts or network services. **The extension remains unreleased, and Firefox playback acceptance is still required.**

## Build 25: Video quality, progress, cancellation and FFmpeg detection (0.2.6)

The optional YouTube download panel now provides three explicit format choices: compatible single-stream MP4, best quality with FFmpeg merging, and audio only (original source format). The optional Linux companion discovers user-provided or system-installed FFmpeg, and the advanced quality choice refuses to run if FFmpeg is missing. FFmpeg is **not downloaded automatically**, not required by the ordinary ad blocker, and unlike the managed yt-dlp binary, system FFmpeg is **not hash verified**.

Video downloads now use a persistent Firefox native messaging port with numeric in-memory progress, a Cancel Download button, and graceful termination of yt-dlp and its child process group. The native side restricts jobs to valid YouTube video IDs and three fixed quality modes, with no arbitrary arguments or browser-cookie access. The companion installer copies the new `download_jobs.py` module, including in the single-file zipapp. Download progress is a best-effort estimate from yt-dlp; it may reset or jump during multiple streams. Partial files may remain after cancellation.

Source-only Build 25 remains **UNRELEASED**. No real YouTube downloads, Firefox playback tests, or ABP-parity verification have passed yet. See `docs/BUILD_25.md`.

## Build 24: local video library and optional direct downloads (0.2.5, unreleased)

The Firefox toolbar now offers **Save for Later**, **Download This Video** and **My Saved Videos** on YouTube video tabs. Saving a video works entirely within Firefox, stores a bounded local-only list of up to 300 entries, and remembers the playback position when the player exposes it. Saved entries can be resumed or removed without a DK account.

Optional video downloading uses a pinned, checksum-verified local yt-dlp binary via the separately installed Linux companion. Downloads are explicitly confirmed by the user, accept only validated YouTube video IDs, run in a single background job, and save under `~/.local/share/dk-live-block/downloads/`. Initial format choice prefers a single MP4 or another single stream, without FFmpeg merging. This does not bypass DRM or grant rights to download protected content. Real YouTube downloading, Firefox playback and ABP parity **remain unverified**. See `docs/BUILD_24.md`.

Developers can generate an unsigned, self-contained Python zipapp companion installer from local source using `python3 scripts/make-companion-installer.py --candidate`. It provides a graphical setup when Tkinter is installed, but the resulting companion is still optional and requires separate user approval. This is **not** a public release.

## Build 23: pinned yt-dlp integration (0.2.4)

Build 23 introduced a pinned official yt-dlp download and removal operation with explicit approval, SHA-256 checking and no-clobber safety. It remained developer source only.

## Build 22: optional Dependencies & Applications Manager (0.2.3)

The Firefox settings page now includes optional tools (yt-dlp, FFmpeg, Deno, Node.js, yt-dlp-ejs) and separately identified recommended editors (Sublime Text, Kate, Geany, VSCodium). The built-in static catalog links only to official HTTPS sites. Users may check tool presence with an **explicitly installed**, optional, read-only Linux native companion, whose installer creates `~/.local/share/dk-live-block/dependencies/` automatically and only registers a Firefox native messaging host for DK Live Block. Basic blocking continues without any native tools or extra permissions. **No third-party dependencies are installed automatically, and video downloading is not implemented.** See `docs/COMPANION.md` and `docs/BUILD_22.md`. All Firefox live playback gates remain open.

## Build 21: responsive YouTube skip checks, safer streaming playback

Internal version 0.2.2 adds bounded, event-driven YouTube preroll/midroll skip-button detection (with the existing periodic safety fallback). It protects recycled Skip Intro and Next controls, observes YouTube-nocookie embeds, and prevents procedural hides of streaming player wrappers. Disney+ playback remains untouched by the YouTube assistant. Six focused observer regressions passed in isolation; the complete repository suite and **live Firefox streaming acceptance are still outstanding**. The extension remains unreleased. See `docs/BUILD_21.md`.

## Build 20B: versioned YouTube advertising rules

The data-only YouTube pack advances to version 2 with additional narrowly targeted ad-labeled desktop and mobile containers. The extension remains self-contained, with Ghostery already bundled. These rules are not proof of successful preroll or midroll video-ad removal in Firefox.

## Build 20: Ghostery arbitration and YouTube playback safeguards

The bundled Ghostery engine supplements the native matcher while respecting native blocks, scoped exceptions, page-wide exclusions and explicit popup-only rules. An ad network match cannot, by itself, close a new browser tab. A stale YouTube skip button no longer blocks a newly appeared control, and skip controls are protected from cosmetic hiding. These improvements are source-tested; **live YouTube and Disney+ playback remain unverified**. No public release is authorized.

## Present development implementation

- Firefox Manifest V2 with a synchronous blocking webRequest listener.
- Bundled offline fallback domain rules and opt-in daily subscription downloads.
- EasyList + EasyPrivacy enabled by default; cookie, annoyance and social lists optional.
- ABP-style URL blocking patterns, ordinary exceptions, type/domain/third-party filters, important, badfilter, scoped named `removeparam` cleanup on navigations, and basic document-wide exceptions.
- Standard cosmetic CSS filters and restricted, domain-scoped text and descendant-matching procedural hiding.
- YouTube Skip Ad button assistant when available. This cannot remove every video ad.
- Opt-in rejection of clearly labeled optional cookie consent buttons in several languages, with single-click safeguards.
- Global, per-site and temporary per-tab pause controls, element picker and undo, temporary host-only request log with per-site allow controls, logging opt-out, clear-log and counter-reset controls.
- JSON preferences export/import. No accounts, telemetry or Acceptable Ads exemptions.

## Verification

Run from the repository root:

    bash scripts/test-local.sh

All GitHub Actions workflows have been removed. Tests are run offline with `bash scripts/test-local.sh`, without consuming hosted runner minutes. These tests do not establish Firefox playback compatibility or ABP feature parity.

## Security and limitations

The engine intentionally declines unsupported directives instead of executing remote scriptlets. Downloaded filter subscriptions are data, not JavaScript code. Requests canceled before download may affect some websites; the toolbar allows a per-site pause. The third-party classifier uses a bundled full Mozilla Public Suffix List snapshot, including private suffixes. Some ad delivery systems are inseparable from protected video streams.

This is **not a released product** and is **not yet certified as good as or better than ABP**.

## No GitHub Actions

No GitHub Actions workflows are permitted. Pushes must not trigger hosted builds or tests. Run tests locally before committing. Keep `.github/workflows/` absent.

## Local performance gate

The offline test runner includes a synthetic **45,000 network-rule / 1,500 request** workload with generous time limits. This is only a JavaScript-core regression benchmark; it is not proof of real Firefox or streaming performance. It uses Node.js locally, never GitHub Actions.

## Anti-adblock notices

DK Live Block includes a default-enabled, switchable anti-adblock notice cleaner for overlays demanding that visitors disable their blocker, including recognizable YouTube prompts. It uses a conservative text classifier and DOM overlay checks, never blindly deletes player components or executes downloaded scripts. It restores hidden elements and page scrolling if blocking is paused. **This cannot guarantee playback when a streaming service enforces restrictions on the server.** The feature is not yet confirmed in live Firefox.

## Subscription popup cleanup

A separately controlled, enabled-by-default feature looks for subscription and article-limit dialogs over article text that is **already present in the page**. It can hide a matching modal and adjacent backdrop and restore page scrolling, without changing payment or authentication state. There are no hardcoded domain exemptions or fabricated article downloads. If a publication sends only a preview or delivers the full story after sign-in, the browser extension cannot reconstruct it. Real Wall Street Journal/BBC behavior still needs testing in Firefox.

## DK Network Recovery / Open Access (unreleased)

Opt-in Firefox proxy routing for selected hostnames or images loaded by selected pages. SOCKS5 with remote DNS, HTTP and HTTPS proxy configurations are supported through Firefox's `proxy.onRequest`. No proxy provider, VPN, Tor daemon or traffic relay is bundled. Normal browsing remains unchanged until routing is explicitly enabled. Firefox may still attempt a direct connection after proxy failure: this is not a leak-proof kill switch, VPN, or anonymity guarantee. The extension separately records bounded, in-memory failed-image and page-host diagnostics and offers a button-initiated DNS lookup via Firefox. It does **not** override Firefox DNS-over-HTTPS settings, automatically retry traffic through unknown relays, or guarantee circumvention of ISP/government controls. Use Firefox settings for DoH and install Tor separately if desired.

## Firefox Add-ons publishing (not yet released)

The project includes local-only manifest checks, a manually gated unsigned packaging script, a [privacy disclosure](docs/PRIVACY.md) and a [Firefox marketplace checklist](docs/FIREFOX_MARKETPLACE.md). No package or public submission will be made before release authorization. See the documentation for permission explanations and Mozilla signing.

## Reduced-bandwidth filter updates

Installed filter lists now retain their HTTP ETag or Last-Modified validator, when provided. Subsequent daily checks can use conditional requests so unchanged lists are reused from local cache without re-downloading their entire contents. Failed updates retain the last working filters and are reported in settings. This is client implementation only; real filter-server behavior still requires Firefox testing.

## Per-site recovery

A website-repair panel lets users review and revoke individual site-specific request allowances previously added from the private request log. No all-or-nothing disabling is required to reverse a mistaken exception.

## Indexed cosmetic filtering

Cosmetic and supported procedural filters are indexed by website domain rather than re-scanning all active hiding rules on every page. A synthetic 40,000-cosmetic / 12,000-procedural offline regression gate protects against severe scaling regressions; live Firefox performance remains unverified.

## Dynamic popup handling

A debounced DOM observer now detects newly inserted anti-adblock and subscription overlays promptly. A low-frequency fallback handles sites that modify existing elements, avoiding frequent whole-page scans when nothing changes. The existing safety checks still refuse to hide players, article bodies and unrelated dialogs.

## Explicit proxy connectivity probe

When proxy domain routing is enabled, the settings page offers a **user-initiated** connection test. It sends a cookie-free HTTPS HEAD request to the selected configured website, avoids following redirects, and checks whether the Firefox proxy routing policy was observed. This verifies neither anonymity nor the absence of fallback/direct-connection leaks. Image-only routing cannot be meaningfully tested by a HEAD request and requires a real image load.

## Safe settings and cache restoration

Stored extension preferences are validated on startup. Corrupt or oversized cached filter lists are discarded instead of being loaded, settings are normalized to known types, and missing enabled lists can be redownloaded when automatic updates are permitted. Disabling the temporary request log also clears existing image-failure diagnostics.

## Performance and safety limits

The network engine now declines unusually long request URLs instead of running potentially expensive regular expressions against them. Additional conservative checks reject common regex structures that can cause catastrophic backtracking. Image-routing rules do not proxy local IPs or single-label intranet hostnames. These checks prioritize browser responsiveness; they are not a formal guarantee against all malicious regular expressions or DNS rebinding.

## Proxy coexistence

DK Network Recovery registers Firefox's proxy interceptor **only** when the user enables selective routing and global protection is active. In domain mode it limits the browser event filter to selected hostnames and subdomains. Disabling routing removes that listener so the extension does not compete with unrelated proxy settings while inactive. Image-only mode still needs a broader event filter because image CDNs may have unrelated hostnames; proxy fallback and anonymity remain unverified.

## Recovery in the toolbar

The toolbar now shows a temporary count of failed website resources when private request logging is enabled, with a direct button to network recovery options. This is a diagnostic indicator, not proof that an ISP or government blocked a resource. No failed request URL is stored in the counter.

## Verified list origins

The subscription updater rejects insecure final destinations after redirects, rejects obvious HTML error pages in place of filter-list data, and preserves previously verified cached rules when a remote response is unsuitable. A response cannot inject executable code through the filter parser.

## Improved third-party classification

The hostname classifier now recognizes more commonly used multi-level country domains and separately operated hosting domains (for example, GitHub Pages and Pages.dev). This improves first/third-party rule matching without remote lookups. The complete Public Suffix List was subsequently integrated in Build 15, as described below.

## Complete Public Suffix List

DK Live Block now bundles the ICANN and PRIVATE sections of the Mozilla Public Suffix List to identify the effective registrable domain for first-party and third-party filtering, including wildcard/exception rules and internationalized names. The dataset is credited under MPL-2.0 and is kept as auditable source under `vendor/`; `src/public-suffix.js` is the generated, extension-bundled representation. Updates should be taken only from the canonical publicsuffix.org source. This is an offline snapshot, not a continuously updated list.

The PSL implementation keeps at most 4,096 cached host classifications in memory; cache entries are automatically discarded in batches when the limit is reached. The offline suite verifies that the generated dataset matches its MPL-licensed source snapshot exactly.

## Streaming playback protection (Build 16 development)

On YouTube, the optional Skip Ad assistant now targets visible, identified ad-skip controls, limits repeat clicks on recycled controls, and will not click unrelated Skip Intro/Next actions. On YouTube and Disney+, cosmetic filters that directly target core video/player controls are excluded before CSS injection. The interactive element picker refuses to hide recognized player components. These are **playback safeguards**, not a guarantee of removing server-inserted video advertising or bypassing protected streams; live Firefox tests remain mandatory.

## Late video-site notices

Build 16 improves anti-adblock text detection for AP-style requests to disable blockers and newer YouTube notice phrases. A bounded mutation observer notices style/class changes to existing overlays, not only newly inserted nodes; self-generated hiding changes do not endlessly rescan. Single-page navigation refreshes settings without touching media playback. Recognition cannot restore content that a service never sends.

## Playback Rescue, opt-in

The toolbar offers an **off-by-default**, site-specific Playback Rescue option on supported YouTube and Disney+ hosts. It lets requests classified by Firefox as `media` pass through network filtering on that selected website while continuing to filter scripts, images, tracking, and other resource types. This can help with false-positive media blocks, but **may also allow video ads** and cannot repair DRM, unavailable videos, or streams delivered through other request types. It does not change video speed, mute audio, bypass subscriptions, or create any external network connection. The setting survives restarts and participates in the local preferences backup.

## Offline video DOM regression checks

Build 16 now includes mocked content-script tests covering YouTube ad-skip click throttling, ordinary Skip Intro protection, Disney+ no-action behavior, disabled/paused operation, and YouTube single-page navigation. The element picker also rejects a container wrapping a live video or audio element. These tests do not replace running Firefox with real video playback.

## Build 17: reversible popup protection

A shared overlay-recovery module now saves the original inline styling of verified anti-adblock and subscription dialogs, removes only explicit adjacent backdrops, and temporarily unlocks page scrolling. If a website re-displays the *same* notice, DK Live Block can re-hide it without losing the original style, then restore the user's page when protection is paused. Player, article, navigation, and password-entry containers are excluded. This is client-side cosmetic cleanup, not a server-side paywall unlock.

## Subscription gate evidence

A subscription notice is hidden only when a substantive article body is present **outside the notice itself**. Dialog paragraphs are excluded from the article-evidence calculation. This reduces the chance of suppressing a legitimate subscription or sign-in screen when a website never provided the complete article. Additional English, French, Spanish and German wording is recognized, but effectiveness on named publishers still requires Firefox testing.

## Site-specific popup cleanup

The Firefox toolbar can exclude **only anti-adblock and subscription-popup cleanup** on an individual website, without disabling network ad/tracker filtering, cosmetic rules, or video playback safeguards. The choice is stored locally, supports settings backup and restoration, and can be reversed with one click. The global anti-adblock and subscription toggles remain independently configurable in settings.

## In-memory popup cleanup count

The toolbar shows how many anti-adblock and subscription overlays DK Live Block has hidden or re-hidden on the current tab. Only a capped numeric total (up to 1,000) is kept in memory, reset on navigation or tab closure. No popup text, full URLs, user data, or telemetry is recorded by this counter. The private count is deliberately not a claim that a paywall or video restriction was bypassed.

## Popup Protection 3.0: hardened recovery

Build 17 adds a local popup safety guard: password, one-time-code, payment, CAPTCHA, and high-risk verification dialogs are never suppressed by the notice cleanup engine. The DOM observer examines only plausible new or changed popup elements instead of rescanning on every unrelated style mutation; a periodic fallback still checks for unrecognized overlays. Repeated settings refreshes avoid unnecessarily revealing already-suppressed popups and ignore stale asynchronous replies. Focus inside a suppressed dialog is blurred to avoid trapping keyboard navigation on an invisible control, without changing video state or site tabindex settings. No content or form values are collected or transmitted.

## Federated sign-in compatibility (Build 17)

Legitimate Google sign-in and federated-account dialogs are protected from overlay cleanup. Explicit ad-popup rules do not close narrowly recognized HTTPS authentication windows from Google, Microsoft, Apple, GitHub and other configured identity-provider origins. Requests for specific Google Sign-In/OAuth resources are spared when necessary for authentication, while unrelated Google ads and tracking hosts remain subject to filtering. This is not a general exemption for every Google-owned website or an assurance that every third-party login works without live browser testing. User passwords, tokens and form values are never read.

Authentication controls are also protected from matching cosmetic and procedural hiding rules, including Google Identity Services sign-in buttons and credential picker containers. Only narrowly identified controls are excluded; ordinary advertisement and tracker selectors continue to work.

## Rapid YouTube compatibility updates

DK Live Block can fetch a tightly restricted, version-numbered, data-only YouTube cosmetic filter pack from the project's public repository. It validates the format, selectors and origin; preserves last-working rules on errors; supports manual checks and one-click rollback with a rejected-version hold. No downloaded executable code, no telemetry and no automatic release package. Maintainers follow [the YouTube maintenance playbook](docs/YOUTUBE_MAINTENANCE.md); real Firefox playback validation is required before changing the pack.

## Voluntary Patreon support

A Patreon button is included in the toolbar and settings footer, but it stays disabled with a **Coming soon** label until the official Patreon creator page is configured. Later, set the verified HTTPS page in `PATREON_URL` in `src/support.js` and ship a normal extension update. The extension does not request payments, contact Patreon automatically, or track supporters. Donations are optional and do not unlock features. Users, including businesses, may use DK Live Block free of charge. The requested no-resale/no-software-monetization policy is a future licensing decision; current source remains MIT-licensed and already-granted rights are unaffected.

## Build 19: embedded Ghostery engine

The real **@ghostery/adblocker 2.20.3** JavaScript engine is **committed at `src/ghostery-vendor.js`** and loaded automatically by the Firefox extension. Its 479,492-byte bundled file comes from the local build and has SHA-256 `ad116ca8d04d716bda3d02e19a35137428b71ae13c6c1f390600830cd8d7e0f9`. It requires no npm, Node.js, package download, or build step on an end user's machine. The final Firefox extension package includes it by default alongside the other `src/` assets. DK's pause, exceptions, streaming/login safeguards, and filter list choices stay in control. New developer builds can optionally regenerate this checked-in file using the pinned local npm dependencies; regeneration is **not required** for Firefox users.

MPL-2.0 applies to the embedded Ghostery code (`src/LICENSE-GHOSTERY.txt`). DK original application code remains MIT. The offline Ghostery network block/exception smoke check passed; full live Firefox, YouTube and Disney+ testing remains outstanding.

## Build 19: conservative on-page ad recognition

DK Live Block now recognizes strongly identifiable ad slots (Google display slots, GPT containers and explicitly advertising-labeled elements) even when downloaded list selectors lag behind. Checks are bounded and local-only, avoid normal sponsored articles, login/payment forms, videos and player controls, and can restore every hidden slot when blocking is paused. This is an additional, conservative heuristic, not guaranteed automatic detection of every ad or every YouTube video insertion.

The new automatic ad-container recognition can be disabled independently in Settings > Video and cookies. Turning it off restores the containers hidden by this heuristic without disabling other ad blocking, sign-in or media protection.

## Efficient filter-engine rebuilds

Changing site pauses, recognition, logging, cookie choices, popup protections, or other unrelated settings no longer recompiles large filter lists. DK Live Block retains the current parsed engine until the combined filter text actually changes. Both the native engine and the optional bundled Ghostery integration benefit from this avoidance of unnecessary work.

### Local Ghostery library installation

From the DK Live Block source directory on Ubuntu run `bash scripts/install-ghostery.sh`. It installs the pinned npm dependencies, compiles a self-contained local `src/ghostery-vendor.js`, and checks basic blocking and scoped exceptions before replacing the placeholder. The script does not open Firefox, prompt for credentials, publish an extension, or create a ZIP. The cloud coding environment cannot reach the npm registry; actual package compilation must occur on an Ubuntu computer with npm access.

Build 20C repairs offline Node VM test fixtures so the real bundled Ghostery, YouTube maintenance and browser-like TextEncoder/TextDecoder globals load together. The filter-list cache regression disables unrelated YouTube fetches in its own test fixture rather than changing production defaults.
