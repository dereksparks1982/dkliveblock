# Build 324: extended DK Live Block development checkpoint

**Date:** November 3, 2026. **Version:** 0.3.294. **Branch:** main. **Status:** Source-only, unreleased, owner testing pending.

Builds 309–324 improve Facebook mutation handling and organic-card protection, Nesty evidence bounds and layout monitoring, YouTube diagnostics and offline comparison integrity, reversible Pornhub layout rollback, and Russian dynamic diagnostics. The installed Firefox extension has not been updated by these commits.

Run `npm run audit:checkpoint` in the existing Ubuntu checkout after updating source to verify seventeen local source-contract invariants. This does not run GitHub Actions, call the network, install anything or certify the full test suite. Run `bash scripts/test-local.sh` separately for native Ubuntu regression acceptance. Source-only fixtures and audits cannot prove that Facebook ads disappeared or YouTube ordinary videos play.

Before release, separately test Facebook Sponsored/Ad posts alongside normal posts, ordinary YouTube in-player refusal versus Free with Ads movies, Disney+ authentication/playback, Pornhub opt-in layout/rollback, English/Russian visual behavior, and Orion experimental support. An accepted source snapshot, README intro and annotated tag are required by the Company Bible.
