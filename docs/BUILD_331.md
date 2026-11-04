# Build 331: inspectable long-feed scan cursors

**Version:** 0.3.301. **Status:** source-only, unreleased.

The approved Facebook full-scan rotating cursors from Build325 were not in the combined local diagnostic's fixed detector key allowlist. The existing explicit Meta report now includes only their safe aggregate numeric positions (articleCursor, bylineCursor, referenceCursor), not post identities, page content, raw URLs, user IDs or private links. Report schema remains v2 and no automated diagnosis calls the new counters evidence of successful ad removal.

Five tests cover allowed numeric counters, invalid values, leakage negatives, triage non-affirmation and unchanged manifest policy. Native Ubuntu suite and actual Firefox device checks still required.
