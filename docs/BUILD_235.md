# DK Live Block Build 235 (0.3.205)

**Scope:** Facebook detection only, continuing from Build 234 on the one authorized branch `main`. No GitHub Actions.

## Changes
- Apply the MIT Facebook blocker's external portal and SVG reference techniques to our existing detector, including split-character labels and separated aria-labelledby fragments.
- Cache only bounded exact ad-label words from removed nodes; respond to relevant Facebook-only DOM text changes.
- Require safe feed card and author-byline structure before using off-card references to hide content. Preserve safe right-rail advertising signatures and user exceptions.
- Add three regression cases (SVG reference, split label ids, removed portal cache), and run seven existing Build 233/234 focused checks.

**Results:** Ten isolated JS checks passed. Real Firefox acceptance and the complete Ubuntu seven-phase suite remain pending. Do not mark Facebook PASS yet.

## After this Facebook work: AI assistance
Record the concept in `docs/ROADMAP.md`: the local owner-initiated **Why wasn't this blocked?** feature, explanation of evidence and permissions, safe preview of site-scoped draft rules, manual approval, undo, no user-data uploading or hidden training. Current AI only assists YouTube playback. No AI code is changed in this build.
