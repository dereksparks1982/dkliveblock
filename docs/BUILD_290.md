# Build 290 / v0.3.260: Nesty Layout Scout
**Date:** November 2, 2026. **Branch:** `main`. **Status:** source build, owner acceptance and exact-commit Firefox QA pending.

Created `src/nesty-layout-scout.js`, a small, deterministic, count-only review component. It is deliberately **not trained machine-learning AI**, does not autonomously modify webpages and cannot generate or execute CSS or filters. The named fourth Nesty specialist uses the in-page Pornhub diagnostic summary only when the owner opens or refreshes the existing Site Dashboard. The existing `src/layout-reflow.js` remains the only module authorized to apply the user's optional CSS grid.

The scout validates fixed quantitative upper bounds and coherence, rejects malformed inputs, exact-site lookalikes and frames, and produces fixed review categories. It can recommend testing the already-existing off-by-default setting, reviewing unsupported markup or checking visual layout in Firefox. Identical patterns observed on repeated manual checks are counted only in temporary page memory (capped at four), never sent to a server, and explicitly **not** evidence of a recurring ad or verified successful repair. Stale and private content never enters the model.

Updated source manifest order, content-to-dashboard message bridge, team roster (4 canonical specialists, 11 original legacy aliases), tests, engineering roadmap and build notes. No extension permissions, dependencies, external scripts, account data, browser geometry, paid/ad whitelist rules, or automatic model learning were added.

**Validation:** JavaScript source and deterministic local tests before pushing; full native Ubuntu regression and owner Firefox layout/scroll/media acceptance still pending.
