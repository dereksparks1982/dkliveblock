# Build 256 · v0.3.226: Owner-directed cookie intelligence foundation

The owner requested a Cookie Intelligence & Control Center: collect minimized evidence of cookies wanting to be set, explain the destination and verified owner where possible, and provide per-cookie Allow/Block toggles and an inspectable history. The complete staged implementation and compatibility requirements are in [COOKIE_INTELLIGENCE.md](COOKIE_INTELLIGENCE.md).

**Implemented:** `src/cookie-intelligence.js` contains an immutable metadata normalizer, bounded local observation registry, and explicit site+cookie-domain+name Allow/Block decision model. Observations and decisions can be cleared independently. Cookie values, credential tokens and request headers are never retained in this model. Isolated JavaScript smoke checks confirmed redaction, exact site scoping and rejection of malformed cookie names. Node regression tests were committed but are not yet executed.

**Not implemented/activated:** Firefox cookies permission, browser change-event capture, Set-Cookie interception, full runtime enforcement, persistent user decisions, dedicated GUI toggles, owner lookup and reason classification. These require a separate and safety-tested integration. No new cookies are blocked or deleted by Build 256.

**Simultaneous Meta work:** Build 255 fixed rejection of the exact Sponsored menu label and expanded whole-post resolution in a safe bounded manner. Facebook live browser behavior remains a reported FAIL pending owner retest.

No new permissions, UI geometry changes, downloads, branches, telemetry, external filter engine or GitHub Actions. The existing cookie consent, YouTube and other approved blocking behavior remains intact.
