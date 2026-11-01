# Build 192: correct cross-site streaming issue counts

**Unreleased source:** 0.3.162, 2026-11-01.

The toolbar's streaming issue count now includes only records for the currently selected streaming hostname, instead of mixing history belonging to a different site previously visited in the same tab.

Changes are source-level and accompanied by permanent regression cases. Full Ubuntu suite and live Firefox comparison are not verified here. No public release, GitHub Actions, user package, or automatic browser launch.
