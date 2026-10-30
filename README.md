# DK Live Block

**UNRELEASED source code.** A Firefox-first ad and tracker blocker being developed by DK LAB / Elderred Softworks. No subscriptions, accounts, "acceptable ads" exemptions, telemetry, or premium-only features.

DK Live Block is **not yet equivalent to Adblock Plus**. Priorities include general automatic ad detection and video-site compatibility, especially YouTube and Disney+. Real Firefox playback behavior still needs verification. Server-inserted advertisements and DRM can limit what a browser extension can remove.

One main branch. Incremental tested development slices. No public release/download until the full feature and stability gates are met.

DK Live Block application code is MIT-licensed; the bundled Mozilla Public Suffix List source and generated dataset are MPL-2.0 (see `src/LICENSE-PSL.txt` and `vendor/public_suffix_list.dat`). External filter subscriptions have their own licenses. No ABP application code is copied.

Run offline checks with: bash scripts/test-local.sh

Developer loading, once all extension files are present: Firefox about:debugging#/runtime/this-firefox, Load Temporary Add-on, select src/manifest.json. A temporary extension is removed when Firefox restarts.

See docs/ROADMAP.md for the acceptance checklist.

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

The hostname classifier now recognizes more commonly used multi-level country domains and separately operated hosting domains (for example, GitHub Pages and Pages.dev). This improves first/third-party rule matching without remote lookups. It remains a **curated approximation**, not the full Mozilla Public Suffix List, and requires a complete PSL before Adblock Plus parity can be claimed.

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
