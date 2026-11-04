# Build 355: GraphQL check snapshot integrity

**Version:** 0.3.325. **Status:** source-only, unreleased.

Facebook's main diagnostic already invalidates old in-flight reads and checks exact-tab navigation, but the separate experimental GraphQL statistics button did not. A new request-generation counter ensures that only the newest GraphQL check may update the UI. Both pre- and post-read tab URLs are verified as the same Facebook HTTPS page. The existing fixed-key, numeric-only redacted result is unchanged; this is read-only and does not activate GraphQL modification or affect network rules.

Five regressions check asynchronous generation, tab bounds, response/error gating, safe projection and permissions. Actual Firefox and native Ubuntu suite acceptance pending.
