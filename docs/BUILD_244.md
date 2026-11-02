# Build 244 · v0.3.214: First operational Meta module and adaptive evidence core

**Completed:**
- Added `src/provider-intelligence.js` with capped (100 entries), local in-memory evidence records, reviewable host/type/signals and explicit clear operation; records are not sent anywhere or automatically persisted.
- Added `src/adaptive-dispatcher.js`, registering up to 16 bounded detectors; independent failures do not crash the others. Detection produces **review** findings, never silent blocking.
- Added `src/meta-module.js` as a Meta-family adapter. Existing Facebook detector runs through it; Instagram, Threads, WhatsApp have platform routing and observation-only investigation, **no invented ad-blocking capability**.
- Updated manifest load order and `src/content.js` to route Facebook scanning and mutation handling through the Meta adapter, preserving existing exceptions and restore logic.
- Added tests for provider observations, dispatcher, platform isolation and manifest order. Source tests **not executed in this environment**.

**Remaining:** connect opt-in local browser request metadata to provider registry; determine actual external ad providers from observed evidence; add independently proven Instagram/Threads DOM adapters and safely selected shared countermeasures; measured AI training/evaluation; full Node test suite and actual Firefox acceptance. Existing YouTube machinery remains unchanged; Facebook live success **not verified**.

No new permissions, external dependencies, telemetry, new branch or GitHub Actions.
