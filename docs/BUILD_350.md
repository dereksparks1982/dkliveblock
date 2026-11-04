# Build 350: large Facebook post evidence window

**Version:** 0.3.320. **Status:** source-only, unreleased.

The per-post sponsored-evidence check previously examined the first 850 descendants. A very large React post could place the explicit Sponsored action/menu at the end beyond this bound. For exceptionally large cards, retain the first 650 candidates and inspect the final 200, preserving the original 850-node maximum and unchanged strict menu, author and reference checks. Ordinary words and buttons never justify hiding.

Five tests cover head/tail quota, an explicit late Sponsored action, ordinary button, malformed lists and safety/version invariants. Native Ubuntu/full Firefox verification pending.
