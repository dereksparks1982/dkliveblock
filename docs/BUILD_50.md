# Build 50: Firefox-native notification permission blocking

**Version 0.3.21 · UNRELEASED development source.**

- Requires Firefox's `browserSettings` API permission, disclosed by Firefox. This is not the extension `notifications` permission that allows add-ons to create messages.
- Uses `webNotificationsDisabled` to set Firefox's browser-wide fallback notification permission to Deny. Default ON under DK Live Block's protection-first policy.
- A Settings checkbox and read-only control report make the global scope explicit.
- Previously allowed site-specific notification permissions are **not revoked or overridden** by this setting. Website allowlisting within DK Live Block has no effect on the Firefox-wide notification permission.
- On global protection or feature toggle OFF, call `clear({})` only if DK Live Block controls the value. Another extension's or enterprise setting is never overwritten.
- No injected scripts, spammy popups, developer marketing, native message uploads or ad allowlisting.
- Legacy hard-coded test fixture loaders updated for previous modules and this build.

**Pending:** full Node/Python regression, real Firefox permissions and notification behavior, other-extension conflicts, setup disclosure and Mozilla AMO review. No Actions, downloads or public release.

Source: https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/browserSettings/webNotificationsDisabled
