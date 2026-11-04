# Build 328: Scrambled Russian ad labels

**Version:** 0.3.298. **Status:** source-only.

The existing specialist could reorder CSS-shuffled English Sponsored letter spans but refused all Cyrillic candidates before reaching its CSS-order decoder. A strict character-multiset prefilter now permits only exact anagrams of «Реклама» or «Спонсировано» to be inspected. It never turns arbitrary Russian post text into an ad candidate; the existing feed geometry, explicit author-label checks and user exceptions remain authoritative.

Five isolated regressions cover normal and scrambled Russian spans, ordinary words, hidden fragments, and unchanged manifest permissions. Native Linux and live Firefox/Orion acceptance are still pending. No user-facing layout, traffic, permission, telemetry or player modification.
