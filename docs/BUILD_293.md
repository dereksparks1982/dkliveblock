# Build 293 / v0.3.263: Verified rollback for the temporary layout preview
**Date:** November 2, 2026. **Branch:** `main`. **Status:** internal source milestone, owner Firefox acceptance pending.

Strengthens the opt-in Pornhub before/after preview introduced in Build 292. Restoration now reports success only when all tracked temporary grid/empty-ad classes and the injected stylesheet have actually been removed. Failed class/style removals remain tracked for an additional retry, rather than being silently forgotten. A preview whose rollback is incomplete returns `restoration-incomplete`; the Site Dashboard advises reloading the original tab if appearance changed.

Fullscreen video/presentation also blocks the temporary preview. The original Pornhub-only CSS Grid experiment remains OFF by default and reversible, and its opt-in application logic, selectors and existing working blocking/streaming paths are not modified.

Seven newly registered offline Node tests cover fullscreen, verified restoration, failed style/class cleanup and retry, repeated preview without duplicates, extension-origin/exact-tab policies, and source inventory. No additional permissions, cloud AI, downloads or new website layout selectors.

**Owner browser gate:** run real Firefox Pornhub video-list and compare-preview checks; record supported markup, appearance, video clicks, resize behavior and restoration. **These have not yet been verified.** The complete exact-commit native Ubuntu suite also remains pending.
