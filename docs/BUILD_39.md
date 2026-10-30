# DK Live Block Build 39: popup activity history

**Version 0.3.10 · UNRELEASED source.**

Adds a bounded, memory-only popup closure history to the Network Monitor, with source-site context, destination hostname when available, closure time, and distinction between strict popunder policy and an ordinary filter rule. Blank-first popunders display an unknown destination unless Firefox later provides an observable hostname. Duplicated browser events do not generate duplicate history entries. Captures are limited to 100 entries per tab with a two-hour expiry; refresh and clear controls are provided.

Only successfully closed tabs are recorded, and only when private request logging is enabled. Raw URLs, URL query parameters, request headers and bodies are not stored. Disabling request logging clears the history. No additional permissions, external dependencies, telemetry, GitHub Actions or public release.

**Pending:** complete local regression suite, Firefox integration, YouTube/Disney+ streaming and ABP feature-parity validation.
