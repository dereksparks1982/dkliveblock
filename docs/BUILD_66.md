# DK Live Block Build 66: permitted request reporting

Unreleased v0.3.36, 2026-10-31.

Users can now export TXT/JSON permitted-request reports for the selected site and a specific inspected destination/type, mirroring the previously implemented blocked-request exports. Records contain only validated hostname, type, aggregated count, coarse last-observed timestamp, manual toggle state, inferred operator and purpose with caveats, and safe research links. Individual data from the original request URL, cookies, query strings, page titles, account IDs and raw payloads is excluded.

Saved manual blocks can still be reported if private logging is off; no new network captures, external dependencies, permissions, or additional services. The report distinguishes total completed permitted events from retained destination/type groups. Browser-side downloads are generated locally with Blob object URLs. Added unit and UI wiring tests; full on-device Ubuntu and Firefox confirmation are still pending.

Parity roadmap: docs/COMPETITOR_PARITY_MASTER_PLAN_2026-10-31.md. YouTube playback is still NOT fixed.
