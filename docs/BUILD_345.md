# Build 345: mobile Facebook scan coverage

**Version:** 0.3.315. **Status:** source-only.

Facebook's mobile html-renderer virtualizes and rearranges feed entries. The regular mobile ad detector previously always examined the first 5,000 label candidates on the current DOM; late entries could remain unseen if those first elements remained. A rotating modulo cursor now advances within the same cap. Author-row location, card-size checks, exact Sponsored labeling, exception and active editor guards are unchanged.

The numeric cursor is added to the privacy-safe explicit Facebook report. Five offline regressions cover oversized scans, wrapping, ordinary content, sanitized reporting and existing mobile protection. Actual Firefox/Orion mobile and Ubuntu suite testing pending.
