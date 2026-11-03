# Build 307: preserve high-signal Facebook React changes under root limits
2026-11-03. Version 0.3.277. Main source only; Firefox acceptance and release pending.

## Root cause uncovered by offline test
Build 306's head/middle/tail sample exposed a second, independent bottleneck: Facebook's scanInserted added roots in mutation order and stopped at 32 roots, even though the callback could contain 40 records. Earlier class/style churn consumed the budget before a late actual Sponsored post could be scanned. The Build 306 integration test correctly failed in isolation.

## Change
The same bounded scan now prioritizes actual added nodes; then characterData, aria-label, aria-labelledby and data-pagelet changes; finally miscellaneous targets. It still examines no more than the supplied first 40 records, collects at most 32 unique roots, inspects at most 320 descendants, hides at most 15 entries and goes through the established safe-card and explicit ad-evidence checks. No stylesheet, account, player, network filter or user preference is changed. Existing Facebook exceptions and restore behavior remain intact.

## Validation
A synthetic source smoke with 39 irrelevant attribute mutations plus one late sponsored insertion confirmed the post is hidden. The identical organic fixture remained visible. Five new offline tests register deeper bounds, the Build 306 failed scenario and module source contracts. Full Ubuntu suite and live Firefox scrolling/organic negative controls remain pending. Do not mark Facebook fully fixed.
