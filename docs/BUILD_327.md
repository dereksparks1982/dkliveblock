# Build 327: Russian Facebook disclosure labels

**Version:** 0.3.297. **Status:** source-only, unreleased.

Add exact translated disclosure label recognition, `Реклама` and `Спонсировано`, to existing Facebook ad-signal checks. These are recognized in the same positions where English `Sponsored` is already examined, with all original author/geometry/normal-post boundaries and exceptions. The Nesty helper shares the fixed exact vocabulary but cannot itself hide content. No broad text contains search and no language-based behavior/geo restrictions.

Five tests cover positives, lexical negatives, safety without evidence, observational specialist, and version/manifest constraints. The exact Russian Facebook presentation varies; **owner Firefox verification is still required before claiming the live labels match.**
