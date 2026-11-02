# Build 255 · v0.3.225: Facebook whole-card detection and literal Sponsored menu fix

## Corrected defects
- The Sponsored action-menu classifier mistakenly required extra words between `Open menu for` and `Sponsored content`, so the plain accessibility label `Open menu for Sponsored content` failed. The bounded exact-phrase matcher now accepts both variants.
- In the bounded fallback for feed cards without explicit article landmarks, the scanner now keeps the **largest safe single-post candidate** rather than returning the first plausible ancestor (often only a header).
- Author detection supports a heading **or an advertiser link**, while preserving separate-post boundaries, safe width/height limits, protected contexts, and DK-owned exceptions.

## Verification
- Executed an isolated JavaScript fixture through the connected tool: the exact plain menu now classifies as Sponsored, and the resolver selected the full post rather than the smaller header or the wider feed.
- Added Node regression tests. Full Ubuntu Node test suite and live Facebook browser verification remain pending.
- Entire standalone MIT reference extension remains unexecuted; existing YouTube and other site logic untouched.

## Still open
Facebook feed **Ad** posts and right-rail sponsored blocks must be retested against the owner's screenshot. A passing synthetic fixture is not a real site success. The broader Meta ad-delivery matrix and cookie-control proposal are separate features, not substitutes for Facebook acceptance.
