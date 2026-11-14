# Build 410: Nesty offline site-holdout evaluation

**DK Live Block · version 0.3.370 · November 14, 2026 · DK Softworks**

**Status:** Offline safety and measurement tooling only. No new AI library or training data from visitors, no automatic browser rule changes, no new permissions, no ML-triggered content hiding, and no release authorization.

## Reused components instead of another engine

- The existing `src/adaptive-model.js` already exposes an uncalibrated synthetic ad-evidence ranking score (`inspectAdCandidate`, model version `synthetic-ad-evidence-v1`), trained previously on 64 synthetic combinations. It is used **only as a review-only candidate**, not as a measured production classifier.
- Build 295's existing `scripts/nesty-evidence-lab.js` provides the confusion-matrix metric code: true/false positives, true/false negatives, precision, recall, false-positive rate and protected-content mistakes. Build 410 imports and reuses that metric implementation.
- The MIT-licensed micrograd provenance and existing offline training experiment remain in `scripts/vendor/micrograd/`. No need to ship another AI engine.
- `mljs/ml` remains a **reviewed but uninstalled candidate** in the reuse catalog. It makes no sense to add an ML package, model weights, browser CPU usage, or a second runtime before acquiring approved independent site labels. The present build creates a measurable selection gate for any future model.

## What is implemented

`scripts/nesty-holdout-evaluator.js` creates **60 self-authored synthetic examples**, ten per site profile: Facebook, YouTube, streaming, Pornhub, general websites and popups. Each profile contains four positive and six negative examples, including two protected contexts and deliberately difficult ordinary-content counterexamples. These are *fictional hand-authored features*, not a sample of actual page ads and not a claim that Facebook/YouTube traffic behaves this way.

**No private inputs:** input schema accepts only an exact, fixed set of known Boolean feature names, fixed site profiles, strict synthetic provenance and bounded synthetic IDs. There is **no** URL, cookie, token, post text, browsing record, account identifier or source-code execution field. Unknown fields, score strings, missing labels, malformed data, oversized files and unbalanced site classes are rejected. The command takes **no user-provided file or URL path**.

**Site-separated cross-validation:** each profile is held out once; only the other five profiles' labeled rows can affect threshold selection. A predetermined seven-threshold grid is evaluated *on training-side folds only*; if no threshold reaches training precision ≥98%, recall ≥50%, false-positive rate ≤5% and zero protected-case false positives, the fold **abstains**. The withheld profile is used for read-only evaluation and cannot be used to select its threshold. This is a holdout **by profile**, not proof of independence from the earlier model's synthetic training combinations. Future real evaluation must establish independent sources and provenance.

**Additional uncertainty evidence:** a 95% Wilson upper bound accompanies the measured false-positive rate. A conservative future adoption requirement includes at least 200 independent negative real-world examples, 100 real positive examples, appropriate site coverage and an upper bound ≤1% on real false-positive rate, plus independently verified real precision/recall. The current generator intentionally cannot satisfy real-data or release gates under any score, even a perfect-looking injected scorer.

## Current synthetic baseline finding

At the pre-existing model's fixed 0.80 score cutoff, the adversarial synthetic cases produce:

| Measure | Synthetic count / result |
| --- | ---: |
| True positives | 24 |
| False positives (ordinary-content negatives) | 18 |
| True negatives | 18 |
| False negatives | 0 |
| Protected-context false positives | 0 (explicit protected-context veto) |
| Precision | 57.14% |
| Recall | 100% |
| False-positive rate | 50% |
| Wilson upper 95% false-positive bound | 65.53% |
| Site folds abstaining on calibration | 6 / 6 |
| Eligible to replace live filters | **No** |

These intentionally challenging synthetic fixtures highlight that the synthetic model's score does **not** reliably identify advertisements without known context. The result is **not an estimate of the actual Facebook or YouTube false-positive rate** and is not evidence that the existing label/rule-based blocker is wrong. It measures an offline candidate on fabricated ambiguity tests only. The current live MIT Facebook detector, YouTube response safeguards and Ghostery/native network filtering are **unchanged**.

## Run on Ubuntu (offline, no dependencies)

```bash
npm run audit:nesty:holdout
node --test tests/nesty-holdout-build410.test.js
npm run test:integration
npm run test:local
```

The audit output includes only aggregate, site-named measures. It never includes individual feature vectors or synthetic IDs, much less real user browsing. No background, network, GitHub Actions, third-party binary, Python runtime, permissions or node_modules installation is needed.

## Acceptance ledger and next

**Completed in source:** deterministic site-held-out safety harness, strict provenance/schema bounds, reusing Build 295 metrics and existing fixed model; Wilson uncertainty; training-only threshold selection, explicit abstention and never-deploy state; new regression suite, offline npm command and roadmap/README.

**Still required:** native Ubuntu regression execution, browser acceptance of previously known issues, labeled **consented and minimized** real samples with separate site/test splits, provenance/retention review, independent model training and evaluation with no contamination, a measured advantage over deterministic rules, and separate owner authorization before any runtime adoption. Do **not** use browsing exports, personal profiles or local request history as training examples by default.

**Next Build 411:** investigate existing Ghostery scriptlet support and anti-circumvention compatibility, including GPL/license boundaries, without copying third-party GPL code or enabling unreviewed remote scripts.
