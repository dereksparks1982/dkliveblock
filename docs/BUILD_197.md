# Build 197: reject corrupt or oversized filter-list updates

**Unreleased:** 0.3.167, November 1, 2026.

The built-in subscription refresh guard now rejects NUL-bearing lists, oversized replacements and candidates exceeding its bounded line budget before considering the list-shrink threshold; existing working cached lists remain authoritative.

Changed JS files parsed in the isolated V8 environment; permanent unit regressions added. No full Ubuntu runner or real Firefox verification, public release or GitHub Actions.
