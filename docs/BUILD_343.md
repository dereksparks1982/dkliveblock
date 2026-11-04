# Build 343: late Sponsored insertion survives a React storm

**Version:** 0.3.313. **Status:** source-only, unreleased.

A forty-record Facebook MutationObserver callback may contain hundreds of added nodes. Earlier insertion records could consume the existing 32 changed-subtree roots, starving a valid Sponsored card inserted in the last record. A new reservation of at most eight roots inspects the last four child-list updates in newest-first order after explicit text-label priorities. The remaining roots still receive the original chronological pass. No budget or eligibility threshold is increased.

Five synthetic tests cover the late sponsored card, matching ordinary negative, caps, retained original pass and version. The first draft's forward tail order failed isolated smoke and was corrected before commit. Real Firefox verification and native Ubuntu suite remain pending.
