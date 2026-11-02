# Build 275 / v0.3.245: Descriptive Agent Nesty specialist team

**Owner instruction:** Retire confusing numbered public agent names. Group popup and redirect detection under one specialist, and use additional agents only for genuinely distinct protection responsibilities.

This change introduces `src/nesty-team.js`, an immutable canonical catalog of three actual specialists:

1. **Nesty Cookie Watch:** three passive observation paths. Never retains cookie values; only the HTTP-response input is currently armed.
2. **Nesty Popup Guard:** strict new-tab trap, XNXX source-linked foreign navigation and original-tab takeovers. The original-tab guard now exposes one `evaluateTakeover` verdict that applies the prior known-destination predicate followed by the previously strict-gated video-confirmation predicate. No network criteria or blocking exceptions were intentionally changed.
3. **Nesty Meta Ad Scout:** six bounded Facebook ad-signal and schema-validation methods. Does not itself remove posts and does not enable experimental GraphQL filtering.

All numeric IDs `agent_nesty_1`–`agent_nesty_5` and `agent_nesty_meta_01`–`_06` remain stable compatibility aliases. Existing extension messages, stored preferences, site-specific permissions and back-compat JS exports remain available. Visible cookie status now uses descriptions rather than legacy numbers; popup log explanations now credit Nesty Popup Guard. No new browser permissions, scripts beyond the tiny catalog, external services or UI geometry changes.

Tests cover unique canonical responsibility, lookup by legacy alias, immutable catalog, unchanged three cookie sensor IDs and armed states, legacy popup detectors, unified takeover outcomes, and Meta aliases. Existing historical release notes are deliberately untouched.

**Verification limitation:** Source checks and test fixtures do not establish real Firefox/Orion browser results. Full seven-phase Ubuntu suite and XNXX/Meta/Orion acceptance remain pending.
