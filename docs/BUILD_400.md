# Build 400 / v0.3.360: bounded Facebook accessibility references

**November 12, 2026. Development on main, not a public release.**

The complete MIT Facebook engine examines every target ID in `aria-labelledby`. In a busy feed, a malformed or adversarially large attribute could trigger a large number of DOM queries and string-normalization passes, especially in the unlabeled-ad fallback which also calls this helper. This build limits individual attributes to 1,024 characters, at most 16 unique referenced IDs per element, and at most 120 characters of decoded live target text.

When a reference list is longer than 16 IDs, eight IDs from the start and eight from the tail are examined so late-added `Sponsored` or `Ad` targets remain eligible. Ineligible overly long attributes and SVG/portal references are ignored instead of producing ad evidence. Other detection paths stay available.

Test fixtures cover 40 IDs, tail-position labels, duplicate IDs and oversized content. This does not change the preexisting MIT page-boundary policy, user-kept Pages, 50ms staging retries, Ghostery engine, existing audio/video protections, license, UI geometry or permissions. Full native Ubuntu and live Firefox ad-removal/false-positive acceptance remain open.
