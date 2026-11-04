# Build 330: CSS-scrambled English ad markers

**Version:** 0.3.300. **Status:** source-only.

The Meta Nesty segmented-label helper previously required an English `spon` or `ad` substring before CSS-order reconstruction. Arbitrary character order could therefore bypass the scanner even when the reconstructed Sponsored/Ad text was unambiguous. Add an exact anagram signature for two recognized English disclosures, preserving the original eight-part candidate cap, CSS visibility, exact final label match and downstream post boundaries. Existing Russian signature code remains.

Five checks cover ordinary Sponsored, fully reversed multi-chunk Sponsored, reversed Ad, false ordering/ordinary text, and Russian compatibility. No privileges, network/video changes or UI geometry updates. Real Firefox acceptance still required.
