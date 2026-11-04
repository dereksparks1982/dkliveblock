# Build 363: Facebook observer lifecycle under DK pause and allowlist
**Version:** 0.3.333. **Date:** 2026-11-04. **Status:** unreleased.

The complete upstream document observer now attaches only when DK authorizes Facebook filtering. Disabling immediately disconnects document, mobile feed-child and reveal observers, clears pending retry labels, restores hidden posts, and prevents background scanning. Enabling reattaches once and scans the live feed. Aggregate observerActive is reported locally. Five offline lifecycle regressions are registered. Native Ubuntu and real signed-in Firefox remain unverified. No permissions or public UI geometry changes.
