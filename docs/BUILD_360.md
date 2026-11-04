# Build 360: full Facebook startup and manifest test corrections

Version 0.3.330, November 3, 2026. Source-only, unreleased.

- Defer Facebook core activation until saved preferences have loaded. Queue the DK authorization request instead of applying default settings before user preferences arrive.
- Retain full original ten-feature MIT engine, active only on Facebook; no duplicate DK DOM scanner.
- Fix old regression tests that assumed the general content script must be in the first manifest entry. It is now the second entry after Facebook-specific bootstrap.
- Remove pinned Build 359 version assertion to permit future updates.
- Full native Ubuntu suite and live Firefox remain unverified. No release, CI, permission or existing UI geometry changes.
