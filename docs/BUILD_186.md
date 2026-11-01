# Build 186: micrograd-trained, fully offline adaptive defense classifier

**Unreleased development source:** v0.3.156 (2026-11-01).

## Chosen upstream
**Andrej Karpathy, micrograd** — https://github.com/karpathy/micrograd
Pinned upstream review: `7bc720e951fe422b8f8814aa5aa1b64121d26b4c`.
License: **MIT**. Vendored upstream `micrograd/engine.py`, `micrograd/nn.py`, and unmodified MIT LICENSE under `scripts/vendor/micrograd/`. These Python modules are **training-time tools only** and are NOT packaged into Firefox's background scripts. Original copyright and license notice preserved. No PyTorch, cloud service, pip install, model download or GitHub Actions required.

## Model and architecture
- `scripts/train-adaptive-model.py`: deterministic, stdlib-only local micrograd training script using **128 synthetic fixtures**. Feature inputs are only six coarse booleans/counts: recent fault count (0–3), whether blocked media was observed, whether media error/buffering was seen, and whether anti-adblock enforcement/ad skip was observed.
- The model is a one-neuron linear classifier trained offline with micrograd's automatic differentiation. The shipped weights are frozen in `src/adaptive-model.js` and score each coarse state with a tiny, bounded JavaScript function. There is **no neural-network training in the browser**.
- `src/adaptive-youtube.js` now consults the model only **after** its deterministic safety conditions for a temporary response-only fallback are satisfied. The model may veto that fallback; it cannot activate any new strategy that the deterministic controller forbids.
- Observed enforcement/ad-skip signals do not count as playback faults and suppress the fallback. The original tab isolation, 20-second fault spacing, two-minute observation window, ten-minute automatic expiration, and manual-mode override still apply.
- The AI cannot create or modify filter rules, block an arbitrary network request, introduce new scripts, upload telemetry, scan video titles/URLs, or create an allowlist. All behavior is local to a Firefox extension tab.
- The manifest explicitly loads `adaptive-model.js` **before** `adaptive-youtube.js`, both before `background.js`. This also corrects a load-order omission in the Build 185 manifest that prevented the controller source from being loaded at runtime.

## Verification
- Ran offline Python micrograd training with a fixed random seed on **128 synthetic training states**, reproducing the frozen weights and classifying **128/128 training states** correctly after 1500 iterations. This is training-set accuracy only, **not generalization**, real ad detection, or calibrated probability.
- Ran the **actual modified bundled JavaScript model and controller** in a sandbox: 128/128 synthetic state classifications and additional behavior/host/scoping checks passed; the model's result can never override the explicit deterministic safety gate.
- Added five permanent test fixtures covering model outputs, malformed input, enforcement and ad-skips, strict Firefox loader order, local inference/no network APIs, and MIT vendoring.
- **Full local Node/Python suite and real Firefox video ad, anti-adblock and performance acceptance remain unrun**. We have no basis to claim that ads which DK currently misses will now disappear. The AI model has not been trained on real labeled YouTube ad delivery behavior.

## Next development
Gather **opt-in, locally summarized, privacy-safe and labeled** playback outcomes to evaluate whether fallback predictions improve playback without letting advertising through. Until then, this synthetic model serves as a deliberately limited architecture prototype. Add holdout data and compare its recommendations against the deterministic baseline before broadening deployment. More approved dormant defenses can be added only after case-specific testing.

**No GitHub Actions, automatic web opening, installation commands, remote AI calls, external runtime dependencies or public release.**
