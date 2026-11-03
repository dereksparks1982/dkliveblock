# DK Live Block: AI and Open-Source Integration Audit

**Research checkpoint:** November 2, 2026. **Source baseline:** Build 287 / `0.3.257`, `main`. **Status:** recommendations only; **no new dependency, trained model, browser permission, or runtime feature installed by this audit**. Keep public README files product-facing. Owner approval is needed before changing established blockers or adding new dependencies.

## Direct answer: how complete is our AI?

- `src/adaptive-model.js` has two small deterministic offline synthetic classifiers: a 256-example recovery ranking model and a 64-example advertising-evidence model. Their scores are **uncalibrated**, not validated on real labeled advertisements. They are not independent ad-discovery systems or continuously trained neural networks.
- `src/nesty-intelligence.js` is a **read-only** company/specialist evidence coordinator and strategy reviewer. Build 287 added real Facebook DOM hide-event aggregate counts, not automatic learning or executable strategy promotion.
- Three canonical specialists are active/registered to varying extents: Cookie Watch, Popup Guard, Meta Ad Scout; 11 old method IDs are aliases, not independent autonomous AI agents.
- The existing Ghostery `@ghostery/adblocker@2.20.3` is embedded locally alongside DK's own network engine and conservative cosmetic layer; this is **a third-party filter engine, not AI**. `src/ghostery-cosmetics.js` does not execute Ghostery's scriptlets automatically.
- No ONNX Runtime Web, Transformers.js, ml.js or other external ML inference runtime is declared in `package.json`. No production-labeled model, model-registry/versioned dataset, drift evaluation, supervised retraining loop, cross-site model-validation benchmark or owner-approved automated strategy activation exists.
- Experimental Facebook GraphQL filtering was made **ON for fresh installs in Build 286** while preserving saved OFF preferences; it is not a machine-learning inference engine and needs real signed-in browser regression.
- Prior successful Ubuntu verification was Build 283 (1,235/1,235 Node, 6/6 Python; release phase failed missing genuine npm lockfile). This is not a passing complete suite for Build 287 or live browser certification.

## Candidate repositories and integration decisions

| Project | License observed | Useful contribution | Decision |
| --- | --- | --- | --- |
| [mljs/ml](https://github.com/mljs/ml) | MIT | Small supervised classifiers, cross-validation/confusion matrix, numerical evaluation; could be an **offline training/evaluation tool** whose compact validated coefficients ship with DK. | **High priority laboratory candidate**; no runtime dependency until real labels and benchmark justify it. |
| [microsoft/onnxruntime](https://github.com/microsoft/onnxruntime) | MIT | Browser-local ONNX inference using WASM; an upgrade path if a measured model beats lightweight scoring on real cases. | **Optional later pilot**, lazy-loaded, packaged model and WASM, no cloud, profile memory/CPU and extension CSP first. |
| [huggingface/transformers.js](https://github.com/huggingface/transformers.js) | Apache-2.0 code; model licenses vary | Locally hosted inference for image/text classification if we can demonstrate it adds unique accuracy. | **Defer**: general-purpose model weights, runtime footprint and privacy risks are poor first choice for an ad blocker. Never download model weights silently. |
| [brave/adblock-rust](https://github.com/brave/adblock-rust) | MPL-2.0 | Independent network/cosmetic filter matching benchmark; supported extension syntax and Apple's content-blocker format conversion for future Orion/Safari study. | **High priority comparison-only**, not a second live ad blocker. Investigate later iOS conversion and limits separately. |
| [cliqz-oss/adblocker](https://github.com/ghostery/adblocker) | MPL-2.0 | DK already embeds its Ghostery lineage; more complete compatibility may be achievable by improving local bridging and tests. | **First engine priority**: audit what is present, parsed, and actually applied before adding another engine. |
| [uBlockOrigin/uAssets](https://github.com/uBlockOrigin/uAssets) | GPL-3.0 | Public issue categories and examples for popups, anti-adblock, video ads, rule syntax, regression scenarios. | **Research/test inspiration only** until list-specific license and distribution requirements reviewed. No unlicensed direct code/list copying. |
| [AdguardTeam/Scriptlets](https://github.com/AdguardTeam/Scriptlets) | GPL-3.0 | Scriptlet compatibility matrix, safety checks and redirect-resource behavior. | **Use as reference for independently designed, audited, locally bundled safe subset**; don't copy GPL code under incompatible DK custom licensing. |
| [AdguardTeam/tsurlfilter](https://github.com/AdguardTeam/tsurlfilter) | GPL-3.0 | Rule AST, DNR and MV2/MV3 integration/testing concepts. | **Research-only** for Firefox/Yandex interoperability tests; avoid replacing Ghostery with another engine. |
| [EFForg/privacybadger](https://github.com/EFForg/privacybadger) | GPL-3.0-or-later | Multiple-site tracking behavior and safe breakage recovery; useful for our future Nesty Provider Investigator. | **Conceptual inspiration / independent implementation**, not code incorporation. Learning from one hostname must never become blanket blocking. |
| [duckduckgo/tracker-radar](https://github.com/duckduckgo/tracker-radar) | CC BY-NC-SA 4.0 dataset | Evidence-backed domains, corporate ownership, prevalence and tracker behavior. It explicitly says it's not a blocklist. | **Reference for research and independent confirmation only** until company use, redistribution, dataset licensing and freshness are reviewed. |
| [duckduckgo/privacy-configuration](https://github.com/duckduckgo/privacy-configuration) | CC BY-NC-SA 4.0 | Explicit documented breakage exceptions, staged protections and browser capability overrides. | **Study methodology**, not wholesale export or automatic allowlists. |
| [abp-filters/abp-filters-anti-cv](https://github.com/abp-filters/abp-filters-anti-cv) | GPLv3 | Tests/examples for ad-reinsertion and rapidly changing anti-circumvention signatures. | **Research/test design only**; no Acceptable Ads program in DK. |
| [AdguardTeam/AdGuardExtra](https://github.com/AdguardTeam/AdGuardExtra) | Verify individual source files and redistribution terms | Site-specific responses to cases normal filtering cannot fix. | **Observe engineering approach only**; no blanket userscript injector and no competitor code copied without license review. |

**Licensing rule:** DK's original code is under a custom free-use/no-monetization source license, not GPL; GPL-licensed source cannot simply be repackaged under DK's restrictions. External lists/data may have additional noncommercial/share-alike requirements. Separate appropriately licensed dependencies retain their own terms. Legal/license review required before distribution of any new component.

## Proposed integration build order (planning only)

### 288: Evidence Lab and engine compatibility report
- Generate a deterministic **positive/negative labeled-fixture schema** for existing ad evidence: exact site/platform, surface, known ad/non-ad, trusted method, outcome, latency and protected-content negative case. Use public/self-created or explicitly sanitized owner-approved fixtures only, not private page exports.
- Build a reproducible test harness to compare **DK native vs installed Ghostery** on realistic filter syntax, with a third optional offline Brave comparison tool *outside* the shipping extension. Report unsupported syntax, exception precedence, anti-adblock/redirect compatibility, CPU and memory.
- Include repeatable acceptance cases for Facebook scrolling/rail/normal posts, YouTube, Disney+, popups, login, Pornhub report, and source exception behavior, without overstating verification.
- Produce a genuine npm lockfile and resolve release audit separately, preserving existing tracked vendored engine reproducibility.

### 289: Nesty Model Lab (actual offline supervised learning candidate)
- Use **real independently labeled ad and normal-content fixtures**, held out by website/profile, to train a small deterministic binary classifier/ranker offline. Compare with the current synthetic model using precision, recall, false positives, and latency; do not treat score as probability without calibration.
- Evaluate `mljs/ml` (MIT) versus our minimal trained coefficient approach; ship only a reproducible small model if it **measurably** adds value. Explicit model version, data provenance, checkpoint hash and rollback.
- In the extension, keep all output observation/review-only. No automatic blocking from uncertain ML scores, no remote model weights, no telemetry or hidden data collection.

### 290: Nesty drift/anomaly and provider research
- Compare bounded aggregate counts, delays, breakage and outcomes against verified baseline trends to flag likely ad-reinsertion/format changes without reading user content. Flag investigation, not a block.
- Keep company-owned systems separate from third-party providers. Introduce Nesty Provider Investigator **only after** independently verified ownership and clear distinct responsibility.
- Add explicit **uncertainty/unknown provider** states, aging of evidence, source links and per-site exceptions.

### 291: Safe rule/scriptlet compatibility
- Audit advanced filter syntax, exceptions, `$important`, `$badfilter`, procedural cosmetics, scriptlets and inert redirect resources. Reuse installed Ghostery where safe; independently implement only narrowly audited alternatives.
- Default-deny executable rule/list-to-JavaScript pipelines, maintain allowlisted local inert resources, preserve login, checkout, media and explicit site pause; run site-level false-positive regression.

### 292: Streaming specialists / browser adapters
- Register distinct Video Ad Scout and Streaming Ad Scout when actual evidence inputs and tests exist; reuse working YouTube/Disney+ engines rather than displacing them.
- Explore Brave's iOS content-blocking conversion in a **separate build artifact**, never claim Orion iOS API coverage from desktop source alone.
- Design Firefox MV2-to-Chromium MV3/Yandex capability adapter and test DNR limits; no misleading unsupported-feature toggles.

## AI priorities and operational constraints
- **What not to install:** a second automatic live engine, untested massive LLM/vision model, cloud AI service, cross-site live retraining from private browsing, speculative auto-created filters, or source from license-incompatible repositories.
- **Performance:** make inference opt-in and off-main-thread if needed; memory budget and battery impact must be measured on modest Linux hardware.
- **Security:** offline test fixtures, bounded features, no personally identifying URL/full request-body/post text/cookies, no automated page scripts sourced from remote filters.
- **Review loop:** candidate evidence → existing deterministic safety → measured site-specific benchmark → owner browser acceptance → scoped, reversible activation. Never let an ML score by itself remove personal posts.
- **Priority today:** existing Ghostery compatibility gaps and real labeled evidence give more benefit than simply adding a high-parameter AI library.

## Status / next decision

This **does not implement** the proposed builds or install AI. Commit as an engineering decision log so the next requested build has a concrete scope. The owner can reprioritize freely. This audit records external repository license descriptions as of the date above; a later integration must recheck exact versions, vendored dependency notices, model licenses, and official documentation.
