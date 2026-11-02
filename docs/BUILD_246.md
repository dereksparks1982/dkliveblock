# Build 246 · v0.3.216: Reviewable and erasable Meta provider intelligence

- Exposed two new extension-only message actions: `getMetaProviderIntel` and `clearMetaProviderIntel`.
- Both require an existing tab on an actual Meta platform, a matching live tab host, and an extension context (not arbitrary content script messages).
- A request for observations returns no data when request logging is disabled. Entries are local, in-memory, capped at 100 destinations, and have unknown ownership/purpose until independently proven.
- The owner can explicitly clear the entire local Meta provider evidence set. Disabling request logs also clears it.
- There is not yet a dedicated interface button; these are integration APIs for the future intelligence dashboard. Do not claim a user-facing dashboard exists.
- Targeted source tests committed, but not executed. Live Firefox tests and full suite remain pending.

No network behavior, blocking rules, existing YouTube flow, passwords, GitHub Actions or approved UI geometry changed.
