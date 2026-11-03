# Build 317: Nesty sees unresolved layout rollback

Source v0.3.287, unreleased. The layout controller tracks cleanupPending after a failed class/style removal and refuses to add new CSS until restoration succeeds. Local diagnostics expose a boolean rather than URLs, titles or coordinates. Nesty Layout Scout returns `layout-cleanup-pending` and recommends retrying existing rollback without executing any action. Five tests cover failure, retry, prevention of CSS stacking and legacy metrics. Native Ubuntu and real browser acceptance remain pending.
