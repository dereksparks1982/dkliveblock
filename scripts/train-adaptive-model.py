"""Offline, deterministic training of a six-feature classifier with MIT micrograd.

No user browsing data, Internet, npm, or runtime browser Python. When retrained,
commit the reviewed weights to src/adaptive-model.js and update validation.
"""
import itertools
import json
import random
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT / "vendor" / "micrograd"))
from micrograd.nn import MLP

random.seed(186)
model = MLP(6, [1])
samples = []
for faults, nearby, error, buffering, enforcement, ad_skip in itertools.product(
    range(4), range(2), range(2), range(2), range(2), range(2)
):
    x = (faults / 3.0, nearby, error, buffering, enforcement, ad_skip)
    good = faults >= 2 and nearby and not enforcement and not ad_skip
    samples.append((x, 1.0 if good else -1.0))

for epoch in range(1500):
    model.zero_grad()
    loss = 0
    for x, label in samples:
        margin = (1.0 - label * model(x)).relu()
        loss = loss + margin**2 * (4.0 if label > 0 else 1.0)
    loss = loss / len(samples)
    loss.backward()
    learning_rate = 0.12 * (1.0 - epoch / 2200.0)
    for p in model.parameters():
        p.data -= learning_rate * p.grad

neuron = model.layers[0].neurons[0]
weights = [round(w.data, 8) for w in neuron.w]
bias = round(neuron.b.data, 8)

def logit(x):
    return sum(a * b for a, b in zip(weights, x)) + bias

correct = sum((logit(x) > 0) == (label > 0) for x, label in samples)
output = {
    "model": "micrograd-synthetic-v1",
    "features": [
        "faultCountNormalized", "blockedMediaEvidence", "sawMediaError",
        "sawBuffering", "sawEnforcement", "sawAdSkip"
    ],
    "weights": weights, "bias": bias,
    "syntheticFixtures": len(samples), "syntheticCorrect": correct,
    "limitations": "Synthetic fixtures only. No real YouTube outcomes were used."
}
print(json.dumps(output, indent=2))
if correct != len(samples):
    raise SystemExit("Rejected: synthetic model failed a training fixture.")
