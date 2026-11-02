# Build 266: Agent Nesty Meta 01-03 and complete offline test inventory

Version 0.3.236. No GitHub Actions, executable release or annotated tag.

## Actual browser-side behavior
- New small, local `meta-agent-nesty.js` module loads **before** Facebook's existing recognizer in Firefox and is shared by the Orion DOM-only experiment. No new permission, external engine, ML downloads or page data collection.
- Agent Nesty Meta 01 decodes two- to eight-piece short Sponsored labels, including CSS ordering, CSS-hidden decoys and bounded class-based decoys. It rejects longer wrappers and only returns exact `Ad` / `Sponsored` words; the existing Facebook detector still requires header/rail geometry, single-card boundaries and exceptions.
- Agent Nesty Meta 02 recognizes extra *explicit* Sponsored content action-menu formats. No ordinary menu, generic Sponsored word or quoted body text is enough.
- Agent Nesty Meta 03 requests a bounded recheck when an ad-label span's style, class or hidden state changes, and wakes the existing scanner when its tracked hidden card is modified. Does not create a new polling loop.
- Existing Facebook, YouTube, GraphQL response filtering (OFF by default), app login, and all approved UI geometry remain unchanged apart from the separately approved Core Protections website heading.

## Tests and limitations
- Executed **11/11** new isolated Javascript synthetic regression scenarios with no failures. The complete Node/Python seven-phase Ubuntu suite and actual Facebook Firefox/Orion browser verification are **NOT RUN** in this environment.
- Repaired the official Linux runner's test inventory: it previously omitted 29 test files added across recent builds. It now registers all 169 current Node test files including this new fixture. This is **test discovery**, not a green full-suite result.
- Never infer real Facebook removal from synthetic fixtures. Test live regular feed Sponsored, right-rail Sponsored, Marketplace, mobile, recycled cards, organic posts, Contacts, Messenger and performance before marking PASS. Leave `metaGraphqlFilter=false`.
- Later Nesty variants: changed GraphQL schemas, JSONL envelopes, recycled story boundaries, canvas/media placement and first-party response transport. Each must be separately proven and gated against false positives.
