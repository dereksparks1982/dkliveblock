# Build 399 / v0.3.359: protected late Facebook Sponsored label evidence

**November 12, 2026. Internal main-only development.**

Facebook's complete MIT engine caches small ID-labelled strings for handling ephemeral accessibility portals. The normal FIFO cache contains 200 arbitrary label values, so a burst of unrelated interface updates can evict a genuine Sponsored label before its post later receives the referencing ARIA attribute. In a scrolling feed, this can make the missed ad impossible to recognize through that reference.

This build keeps the entire 200-entry generic cache **unchanged in capacity** because organic labels must be remembered too: treating old ordinary references as dangling can trigger unwanted shape-based hiding. A separate 64-entry, 30-second cache holds only exact recognized sponsored, suggested and locally supported foreign-label terms, without post text, identifiers outside the in-memory key, browsing history, URLs or storage. It is used only when the live target is absent and the generic cache no longer has the ID. Reusing an ID for ordinary text invalidates any earlier ad rescue; current live DOM text always outranks the caches.

Malformed and exceptionally long IDs/raw content are refused, and the temporary rescue memory is cleared when protection pauses. The existing 50ms reparent retry, shape safeguards, user-kept Pages, 2026-site licensing and settings remain untouched. Synthetic tests cover late refs, 260 unrelated updates, expiry, recycling and hard bounds. The complete native Ubuntu suite and live Facebook visual outcome are unverified.
