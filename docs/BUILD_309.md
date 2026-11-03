# Build 309: Facebook late addedNodes under eight-node cap

November 3, 2026. Source version 0.3.279, not accepted for public release.

Fix a remaining Facebook fast path gap: an oversized React childList could append an Ad post at position nine or later, while the old scan examined only the first eight added siblings. Select the first four and last four for consideration without increasing per-record work or weakening the vetted safe-card, evidence and undo checks. Tests cover last-position ads, equivalent organic posts, oversized/invalid input, normal restore, and live version consistency. Full native Linux suite and actual Firefox success are pending.
