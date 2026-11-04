# Build 352: independent Facebook article anchor tail safety

**Version:** 0.3.322. **Status:** unreleased, source-only.

Facebook sometimes nests article markers inside comments or shared content, so the wrapper safety check counts only independent posts rather than every nested anchor. Its former first-100-anchor pass might miss two independent posts after a long nested comment list. The same 100-candidate window now includes the first 50 and last 50 anchors. If two separate posts are discovered, whole-wrapper hiding is prohibited. Ordinary single-post cards retain their expected behavior.

Five tests exercise two independent tail anchors, nested-only controls, bounds, invalid input and unchanged scope. Native Ubuntu/Firefox verification pending.
