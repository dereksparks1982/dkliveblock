# Build 150: cross-feature regression milestone

**Version 0.3.120. Unreleased development source.**

The existing local-only reliability contract now cross-checks six major areas introduced through Builds 134–149: class/ID scoped literal cosmetic rules, YouTube feed-only object descriptor inspection, unchanged explicit playback refusal responses, Google Ad Manager inventory frames and ad-slot attributes, expanded exact tracking identifier cleanup with whole-URL sign-in safeguards, and safe UTF-8-only response interception. Existing fixture tests also cover stream error byte replay, page API immutability, protected DOM restoration and unsupported navigation rule modifiers.

No new install dependencies, downloaded scripts, GitHub Actions, UI rearrangements or public release. This commit has source syntax checks and targeted source-level validation only. **The full 111-file JavaScript test runner, Linux companion Python tests and real Firefox playback/ad-blocking acceptance have not been executed from this environment.** A release must not be claimed until those gates pass and the owner approves the final snapshot/tag.
