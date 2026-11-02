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

## External source review (November 1, 2026)
Reviewed the MIT-licensed Facebook specialist `browseraddonsupport-wq/fb-sponsored-ad-post-blocker`, `Mowd/facebook-feed-filter`, `imrehorvath/facebook-feeds-filter`, and older `facebook-adblock/facebook_adblock`.
- Specialist's October 31 update describes advertisements where the `Ad` badge arrives after the rest of the card. Extend our existing character-data mutation rescan to recognize short label changes within feed context.
- Its documented `aria-posinset` single-post anchor is already present in our `ARTICLE` selector. Avoid assuming `role="article"` exists.
- Explicit caution: `data-ad-rendering-role` alone is shared by normal Facebook posts. Never auto-hide solely from that marker.
- Category-level response rewriting in `imrehorvath/facebook-feeds-filter` might work for specific API response formats but requires separate parsing, compatibility, and privacy validation. Not integrated blindly.
- Avoid dependency on these projects at runtime; use evidence and small independently reviewed changes instead.
- No real Facebook browsing session or full local Node run was available here. The build is **not verified**.
