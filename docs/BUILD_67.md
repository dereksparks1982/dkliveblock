# Build 67: Privacy-safe filter source attribution

Unreleased v0.3.37 (2026-10-31).

Match native rule keys to the sources that are currently enabled. Sources are the built-in seed, specific named public lists, generic numbered custom subscriptions, custom user rules, and the cosmetic YouTube pack. Duplicate parsed rule keys are intentionally marked 'Multiple active filter sources'. User-custom URLs and raw matched paths, tokens, cookies, headers and request bodies are never exported. The map is rebuilt on rule-text changes, up to 250,000 candidates. Attribution can be incomplete when more rules are loaded. Ghostery-only network matches are labelled separately. Does not change blocking decisions or enable new ad blocking.

Site Dashboard Details and TXT/JSON blocked reports now include this source hint. Adds unit tests and an existing Firefox-like background fixture assertion. Full Ubuntu suite and real Firefox acceptance pending. YouTube remains unfixed.
