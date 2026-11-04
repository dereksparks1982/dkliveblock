# Build 347: late ad-label portal IDs

**Version:** 0.3.317. **Status:** source-only.

The Facebook observer remembers ephemeral external ad-label IDs for referenced cards, but its former first-60-descendants pass skipped a Sponsored portal later in an ID-heavy React subtree. It now samples the first 30 and last 30 IDs under the identical sixty-node budget. Only exact Sponsored/Ad words enter the expiring cache, and actual hiding still requires a vetted single-post attribution signal.

Five regression cases cover late genuine portal, ordinary text negative, bounded long/short input, cache limit and version. Full Ubuntu and live Firefox acceptance pending.
