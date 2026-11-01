"""Reproducible offline seven-feature linear model training.

Uses an explicit analytic gradient of the same squared-hinge single-neuron
objective prototyped with vendored MIT micrograd. Python standard library only.
Training fixtures are synthetic: no visits, video IDs or personal data.
"""
import itertools
import json
import random

random.seed(231)
features = [
 "faultCountNormalized", "blockedMediaEvidence", "sawMediaError", "sawBuffering",
 "sawEnforcement", "sawAdSkip", "sawAdShowing"
]
rows=[]
for faults, nearby, error, buffering, enforcement, ad_skip, ad_showing in itertools.product(
 range(4), range(2), range(2), range(2), range(2), range(2), range(2)
):
 x=(faults/3,nearby,error,buffering,enforcement,ad_skip,ad_showing)
 allow=faults>=2 and nearby and not enforcement and not ad_skip and not ad_showing
 rows.append((x,1 if allow else -1))
weights=[random.uniform(-0.4,0.4) for _ in features]
bias=0.0
for epoch in range(1600):
 dw=[0.0]*len(features)
 db=0.0
 for x,y in rows:
  activation=sum(w*v for w,v in zip(weights,x))+bias
  margin=max(0.,1-y*activation)
  if not margin:continue
  gradient=-2*y*margin*(4.0 if y>0 else 1.0)/len(rows)
  db+=gradient
  for i,v in enumerate(x):dw[i]+=gradient*v
  # Same annealing as the micrograd prototype, without constructing 256k graphs.
 rate=0.14*(1-epoch/2200)
 weights=[w-rate*g for w,g in zip(weights,dw)]
 bias-=rate*db
weights=[round(w,8) for w in weights]
bias=round(bias,8)
def score(x):
 logit=sum(w*v for w,v in zip(weights,x))+bias
 return 1/(1+__import__('math').exp(-logit))
# Model threshold is 0.60; validate that decision, not an unrelated >0 logit.
correct=sum((score(x)>=0.60)==(y>0) for x,y in rows)
print(json.dumps({"model":"offline-synthetic-v2","features":features,
 "weights":weights,"bias":bias,"threshold":0.60,
 "syntheticFixtures":len(rows),"syntheticCorrect":correct,
 "limitations":"Synthetic fixtures only. No real-world accuracy or calibration claim."},indent=2))
if correct!=len(rows):raise SystemExit("Rejected: training model did not classify all synthetic fixtures.")
