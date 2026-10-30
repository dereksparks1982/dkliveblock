# DK Live Block Build 36: strict piracy-site popunder defense

**Version 0.3.7, UNRELEASED source.**

## Changes
- Default enabled site-specific policy for exact The Pirate Bay and 1337x hostname families (including subdomains and common numbered mirrors), rather than attempting to hardcode rotating scam-ad destination domains.
- New tabs with an attributed opener on the protected site are closed from the earliest available `tabs.onCreated` event, including initial blank-tab popunders. Firefox `webNavigation.onCreatedNavigationTarget` supplies a second detection path and the existing rule-based popup handler remains for all other sites.
- Matching main-frame network requests of identified popup tabs are canceled before the tab is removed when the request event is observed in time.
- Per-source tab closure count also contributes to DK Live Block's ordinary blocked-request badge.
- A short-lived deduplication map prevents the two browser events from double counting the same new tab.
- Toolbar exposes a precise, user-initiated `Allow next new tab (15 seconds)` bypass. This is consumed once only. This override can be consumed by an unwanted new tab, so it should be used sparingly.
- Settings exposes a default-on checkbox to disable aggressive protection when necessary. Without strict protection, the existing data-only popup rules still apply.
- No third-party helper or additional browser permissions.

## Known limitations
- Firefox event delivery, browser's own popup blocker, `noopener`/openerless browsing contexts, service-worker or extension-created tabs, full-page same-tab redirects and site mirror variations can affect interception. No anti-popup implementation can honestly guarantee all present and future techniques are blocked without live testing.
- Deliberate new-tab navigation from protected sites will also be blocked until the user uses the temporary bypass; same-tab navigation and magnet protocol links are not blocked by this policy.
- Full offline regression and live Firefox/Pirate Bay/1337x integration tests remain uncompleted. This source is **not released**.
