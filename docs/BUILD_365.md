# Build 365: accountable Facebook hide and restore reasons

**Version:** 0.3.335. **Date:** 2026-11-04. **Status:** unreleased.

- Record only cumulative aggregate successful hide operations by original full-core reason: explicit label, unlabeled shape inference, user-marked advertiser, Suggested post, unfollowed Page/Group, optional feed section, or other.
- Count successful restore operations separately. These are operation counters, not distinct posts or claims that a viewer was ad-free.
- Wire counters through the same fixed-key, size-bounded local Facebook diagnostic export so a 15–30-second ad appearance can be distinguished from inference of unlabeled ads and accidental non-ad removal.
- Five offline Node regression cases cover bucket inclusion, whitelisting, rejected malformed values and the complete original hide/restore routines.
- No Page names, IDs, URLs, browsing history, post text, network telemetry or new permissions. Full Ubuntu suite and real Facebook acceptance pending.
