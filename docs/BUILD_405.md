# Build 405 / v0.3.365: Open-source integration groundwork, not another hand-written filtering engine

**November 13, 2026. DK Softworks, `main`.**

The owner requested documentation and a concrete roadmap for using upstream open-source repositories before further custom development. We checked the current GitHub repository, its actual installed code and the older Build 287 integration audit. The existing bundle already includes Ghostery MPL-2.0, Mozilla PSL MPL-2.0, complete adapted MIT Facebook Sponsored detector and an offline vendored MIT micrograd research component. Other projects in the previous assistant response were **not** integrated and are now explicitly marked as planned evaluation, research-only or deferred.

The living [OPEN_SOURCE_INTEGRATION_ROADMAP](OPEN_SOURCE_INTEGRATION_ROADMAP.md) records upstream repo and license metadata current at the checkpoint, compatibility constraints for the custom no-monetization DK source license, GitHub archival status of old anti-circumvention filters, acceptance gates and the ordered Build 406–416 sequence. Repository-level SPDX does not replace per-file license review.

**Implementation:** new static `scripts/open-source-integration-catalog.js`, offline `scripts/open-source-integration-audit.js` and tests. The latter **reuses** both `scripts/third-party-license-gate.js` and `scripts/engine-verdict-audit.js`. The preexisting differential engine's sample set is larger, and its direct Ghostery evaluation now normalizes `imageset` and `beacon` through DK's real adapter, fixing an audit mismatch. Commands: `npm run audit:reuse`, `npm run audit:engine-compat`.

No new npm dependency, copied GPL code, license/manifest permission, runtime blocking behavior, site settings, profile storage, Nesty agent or UI geometry is introduced. The integration status is *evidence-based*, not a claim of blocker parity or browser success. Run native local Node/Python suite and real Firefox owner acceptance in the later stabilization phase. No Actions or release requested.

## Focused fixture correction

The initial isolated catalog test caught a case-sensitive assertion mismatch (the validator said `missing local evidence`; the test expected capital `Missing`). The test now validates the diagnostic without relying on capitalization. The catalog validator also returns a clear failure instead of throwing for null entries. These corrections do not alter live filtering or extension behavior.
