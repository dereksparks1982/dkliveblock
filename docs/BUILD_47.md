# Build 47: individual filter-list management

**Unreleased development source · version 0.3.18.**

Added a status and Update button for each of the five included lists. Each built-in list has an immediate enable/disable control, persisted independently of unrelated Settings. Enabling a missing cached list explicitly prompts the user to download it; no false claim of active coverage. Individual checks preserve an existing valid cached version on failures. Entire enabled-list refresh behavior remains available.

Custom HTTPS subscriptions now have individually visible status, manual Refresh, and Remove. No arbitrary URL can be refreshed or removed unless it belongs to the user's saved subscriptions. Existing five-list limit, HTTPS-only validation, size/caching limits, and data-only parsing remain unchanged. Status displays use textContent to avoid HTML injection.

**Tests still outstanding:** complete Node/Python suite, real Firefox options interactions, simultaneous updates, cached list recovery and extension storage survival. No GitHub Actions, downloads, or public release.
