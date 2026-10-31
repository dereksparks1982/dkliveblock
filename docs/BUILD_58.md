# Build 58: popup, privacy and cookie-dialog reliability

**Unreleased source, version 0.3.29. October 30, 2026.**

The strict popup trap now rechecks the actual originating tab before removing a new tab. Stale source-host caches cannot alone authorize a destructive close. The existing short-lived early claim still cancels blank-first navigation while the background checks the source; the one-time user override remains. Same-host reloads retain popup totals. The local host-only popup history rejects future or invalid timestamps.

Tracking-parameter stripping now bypasses signed links, OAuth/SAML callbacks and other signature-bearing URLs, and never rewrites non-GET main-frame submissions. Ordinary UTM/fbclid cleanup remains active.

Consent handling checks the banner itself for visibility and seeks explicit reject controls in bounded nested open-shadow components, inspecting no input values. Unsupported and closed-root consent flows are still left alone.

Added regression cases. Full local and live Firefox tests remain mandatory. No GitHub Actions, new permissions, external dependencies, telemetry, downloadable build or release.
