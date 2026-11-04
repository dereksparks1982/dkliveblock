# Build 346: rotating explicit-ad fallback

**Version:** 0.3.316. **Status:** source-only, unreleased.

The last fallback path for Facebook ad explainer links and exact Sponsored-content menus scanned only the first 160 matching elements repeatedly. It now rotates the same budget across the current DOM. All existing proof, geometry, exception and content safety checks remain. Only the bounded numeric cursor is available in the explicit redacted local report.

Five tests cover long lists, wrapping, organic preservation, sanitized export and source contracts. Native Ubuntu and live Firefox tests pending.
