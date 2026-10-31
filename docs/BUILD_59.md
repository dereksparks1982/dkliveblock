# Build 59: usable site dashboard and exception controls

**Version 0.3.30 · UNRELEASED source · October 30, 2026**

A Site Dashboard is available directly from the Firefox toolbar popup. It uses one extension-only background snapshot verified against Firefox's **live selected-tab URL**, not a forged URL passed by a website. Browser-internal tabs show a safe unsupported state. No broadening of page/content-script permissions.

The dashboard shows global, site and tab blocking state, site cleanup switches, blocked-request counters, recent blocked hostnames and resource types (only when private request logging is on), recently closed popup destinations, per-site custom host allowances and site/host/type request exceptions. Request descriptions are explicitly labeled as **heuristics**, not evidence of device or filesystem access. No raw URL paths, query strings, credentials or HTTP bodies are included.

Users can pause/resume a tab, allowlist/remove a site, separately pause/resume cookie rejection and distractions, and revoke existing host and typed-request allowances. Potentially disruptive actions require confirmation. A dedicated link opens the existing opt-in Network Monitor; the dashboard never starts network monitoring automatically. An option to clear local blocked-request history is explicit.

The existing toolbar dimensions and other button geometry are retained. The dashboard uses a responsive standalone page, ordinary DOM text nodes, visible focus rings and ARIA status messages. No remote dependencies, accounts, new permissions, telemetry or paid exemptions.

**Acceptance pending:** complete Node/Python regressions and real Firefox keyboard/screen-reader, accessibility, visual and long-session testing. YouTube, Disney+ and ABP parity remain unverified. No GitHub Actions, release or package.
