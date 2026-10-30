# Build 53: custom filter syntax diagnostics

**Version 0.3.24 · UNRELEASED source.**

A user-clicked **Check custom filter syntax** button in Settings checks the text currently present in the Custom Filters editor, using DK Live Block's actual `DKRules.network`, `DKRules.cosmetic` and `DKRules.procedural` parser functions. The local preview summarizes counts for supported network, cosmetic and procedural rules, comments, duplicate lines, and unsupported syntax. It gives line numbers and generic error kinds but **does not echo the user's rule contents**.

This is a **read-only check**: no automatic saves, changes to filter rules, downloads, requests, scripts, eval, new permissions, tracking or acceptable-ad exceptions. The existing Save Settings button stays separate. Input is capped at 1 MB and 20,000 lines; only the first 30 diagnostics appear.

**Limits:** DK's supported syntax is currently a subset of ABP's and the analyzer does not guarantee the rule blocks any particular live advert. Scriptlets, HTML filtering, redirects and other unsupported formats are reported, not executed. Full Node/Python tests, real Firefox validation and long-input performance tests remain pending. No GitHub Actions, downloads or public release.
