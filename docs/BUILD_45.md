# DK Live Block Build 45: advanced controls and complete ABP screenshot audit

**Version 0.3.16 · UNRELEASED source. 30 October 2026.**

### Implemented in source

- Context menu **Block element with DK Live Block**, using our existing visual picker. Restricted URLs and paused domains are rejected. No network uploads or independent picker code.
- User preference for toolbar blocked-request badge; starts on and can be disabled without disabling protection.
- Optional Firefox Developer Tools panel showing hostname-level network monitor records, with explicit Start/Stop/Clear/Refresh. Developer permission requested only from a user gesture in Settings.
- Dedicated checkbox preferences and migration/restoration of those settings.
- Tests for context menu, optional developer panel and asset wiring.
- Full screenshot-by-screenshot ABP General/Advanced inventory in `ABP_FEATURE_INVENTORY.md`, explicitly including the checked **promotional messages** preference and identifying it as *intentionally absent* in DK Live Block.

### Privacy / marketing commitments

No promotional notifications, Acceptable Ads advertising exemptions, sponsor placements, advertising-revenue whitelist, upgrade nag, premium lock or required promotional setting exists in DK Live Block. Basic blocking remains free, enabled on new installations and does not require a separate account.

### Unfinished

- Dedicated debug-mode element hiding overlay, per-filter detailed configuration and multi-language catalog.
- Browser-owned notification permission handling where permitted by Firefox, not invasive workarounds.
- Complete full Node/Python suite and live Firefox testing of context menu, DevTools API and streaming sites.
- No GitHub Actions, no packaged download, no public release and no claim of ABP parity.

See [full ABP inventory](ABP_FEATURE_INVENTORY.md), [existing parity checklist](ABP_PARITY_CHECKLIST.md), and [roadmap](ROADMAP.md).
