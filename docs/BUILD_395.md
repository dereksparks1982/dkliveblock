# Build 395 / v0.3.355: bounded Facebook dual reverse-reference recovery

**November 4, 2026. Internal main-branch development; no public release.**

The complete licensed MIT Facebook Sponsored detector previously stopped after the first matching ARIA reverse reference, even when a live SVG-use referrer pointed to the actual feed card. This could miss an advertisement while the unrelated or detached first referrer was processed.

The existing code now checks one candidate from each recognized route. Duplicates/self-links are skipped, malformed selectors are ignored per route, and the Build 391 eight-hop in-flight guard still prevents recursion and releases references on failure.

No extra document observer, network rule, page-hiding heuristic, storage, telemetry or UI geometry changed. Tests execute the exact production function in fake DOM relationship graphs. Full native Ubuntu and owner Firefox testing remain pending.
