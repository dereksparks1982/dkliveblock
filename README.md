# DK Live Block

**UNRELEASED source code.** A Firefox-first ad and tracker blocker being developed by DK LAB / Elderred Softworks. No subscriptions, accounts, "acceptable ads" exemptions, telemetry, or premium-only features.

DK Live Block is **not yet equivalent to Adblock Plus**. Priorities include general automatic ad detection and video-site compatibility, especially YouTube and Disney+. Real Firefox playback behavior still needs verification. Server-inserted advertisements and DRM can limit what a browser extension can remove.

One main branch. Incremental tested development slices. No public release/download until the full feature and stability gates are met.

Source is MIT-licensed. External filter subscriptions have their own licenses. No ABP application code is copied.

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

The engine intentionally declines unsupported directives instead of executing remote scriptlets. Downloaded filter subscriptions are data, not JavaScript code. Requests canceled before download may affect some websites; the toolbar allows a per-site pause. The third-party classifier uses a limited suffix approximation, not the full Public Suffix List. Some ad delivery systems are inseparable from protected video streams.

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
