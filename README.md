# DK Live Block

**UNRELEASED source code, current development version 0.2.7 (Build 26).** A Firefox-first ad and tracker blocker being developed by DK LAB / Elderred Softworks. No subscriptions, accounts, "acceptable ads" exemptions, telemetry, or premium-only features.

DK Live Block is **not yet equivalent to Adblock Plus**. Priorities include general automatic ad detection and video-site compatibility, especially YouTube and Disney+. Real Firefox playback behavior still needs verification. Server-inserted advertisements and DRM can limit what a browser extension can remove.

One main branch, rapid source development and fixes as problems are found. No public release until the extension is ready.

DK Live Block application code is MIT-licensed; the locally bundled Ghostery filtering engine and Mozilla Public Suffix List components are MPL-2.0 (see `src/LICENSE-PSL.txt` and `vendor/public_suffix_list.dat`). External filter subscriptions have their own licenses. No ABP application code is copied.

The **Ghostery filtering engine is included in this repository and loads with the extension**. Firefox users will not need Node.js, npm, Ghostery installation, a second download, or a separate account. The current code remains unreleased pending real Firefox validation.

Developers may run optional offline checks with: bash scripts/test-local.sh

Developer loading, once all extension files are present: Firefox about:debugging#/runtime/this-firefox, Load Temporary Add-on, select src/manifest.json. A temporary extension is removed when Firefox restarts.

See docs/ROADMAP.md for the acceptance checklist.

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
