"""Reproducible synthetic ad-evidence ranking, Build 236.
This 64-case training set is NOT real-world accuracy evidence.
Only the owner-initiated page inspector uses these scores. It never blocks.
The weights are baked into src/adaptive-model.js, with no runtime training.
"""
import itertools
import json
import math

FEATURES = ("knownSlot", "sponsoredMenu", "adExplainer",
            "railAdLink", "authorAdByline", "protectedContext")
rows = []
for x in itertools.product((0, 1), repeat=len(FEATURES)):
    target = int(any(x[:5]) and not x[5])
    rows.append((x, target))
weights = [0.] * len(FEATURES)
bias = 0.
for iteration in range(6000):
    dw = [0.] * len(FEATURES)
    db = 0.
    for x, target in rows:
        logit = bias + sum(a*b for a,b in zip(weights,x))
        p = 1/(1+math.exp(-logit))
        g = (p-target)/len(rows)
        db += g
        for i,value in enumerate(x):
            dw[i] += g*value
    rate = 0.6*max(0.15, 1-iteration/6000)
    weights = [w-rate*g for w,g in zip(weights,dw)]
    bias -= rate*db
threshold = 0.80
def score(x):
    return 1/(1+math.exp(-(bias+sum(a*b for a,b in zip(weights,x)))))
correct = sum((score(x)>=threshold)==bool(target) for x,target in rows)
report = {"version":"synthetic-ad-evidence-v1","features":FEATURES,
    "weights":[round(w,8) for w in weights],
    "bias":round(bias,8),"threshold":threshold,
    "syntheticCases":len(rows),"syntheticCorrect":correct,
    "limitations":"Synthetic fixtures only; uncalibrated evidence score, not live ad recognition."}
print(json.dumps(report, indent=2))
if correct != len(rows):
    raise SystemExit("Synthetic ranking failed.")
