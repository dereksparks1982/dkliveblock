# DK Live Block

**UNRELEASED source code.** A Firefox-first ad and tracker blocker being developed by DK LAB / Elderred Softworks. No subscriptions, accounts, "acceptable ads" exemptions, telemetry, or premium-only features.

DK Live Block is **not yet equivalent to Adblock Plus**. Priorities include general automatic ad detection and video-site compatibility, especially YouTube and Disney+. Real Firefox playback behavior still needs verification. Server-inserted advertisements and DRM can limit what a browser extension can remove.

One main branch. Incremental tested development slices. No public release/download until the full feature and stability gates are met.

Source is MIT-licensed. External filter subscriptions have their own licenses. No ABP application code is copied.

Run tests with: node --test tests/*.test.js

Developer loading, once all extension files are present: Firefox about:debugging#/runtime/this-firefox, Load Temporary Add-on, select src/manifest.json. A temporary extension is removed when Firefox restarts.

See docs/ROADMAP.md for the acceptance checklist.
