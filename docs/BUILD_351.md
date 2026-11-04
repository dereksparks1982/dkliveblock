# Build 351: multi-post wrapper tail safety

**Version:** 0.3.321. **Status:** source-only, unreleased.

Before hiding a Sponsored-looking wrapper, DK Live Block checks whether its direct children contain multiple independent, full-sized posts. The prior 60-child prefix could ignore two sibling posts near the end of an unusually large React wrapper, risking removal of nearby organic content. It now samples 30 first and 30 last children within the original 60-element cap and retains the unchanged two-post boundary veto.

Five tests include two late sibling posts, only-one-post negative, work cap, malformed inputs and SafeCard integration. Native Ubuntu and real Firefox verification pending.
