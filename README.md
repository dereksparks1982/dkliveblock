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
- ABP-style URL blocking patterns, ordinary exceptions, type/domain/third-party filters, important, badfilter, and basic document-wide exceptions.
- Standard cosmetic CSS filters and restricted, domain-scoped text-only procedural hiding.
- YouTube Skip Ad button assistant when available. This cannot remove every video ad.
- Opt-in rejection of clearly labeled optional cookie consent buttons.
- Global and per-site switches, element picker and undo, temporary host-only request log with per-site allow controls.
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
