# Build 242 · v0.3.212: Facebook automatic post fallback

## Work
- Removed the mandatory dependency on the optional Ad Investigator in Facebook's sponsored-menu-to-card resolver.
- Prefer existing investigator evidence when available; otherwise choose a bounded single FeedUnit/article landmark or a local post with author heading.
- Reject multi-post wrappers by requiring exactly one sponsored action menu in the fallback container.
- Maintain existing protections for navigation, dialogs, forms, sidebar, user exceptions, and reversible inline hides.
- Add isolated regression fixtures for the new resolver.

## Verification gate
Source updated on main. The new tests and live Firefox acceptance are not run in this environment. **Facebook cannot be marked PASS** until Sponsored feed posts and the right rail disappear automatically without damage to ordinary posts or Messenger, and existing YouTube/streaming behavior remains unchanged.

No new permissions, packages, outside engines, Actions, or branches.
