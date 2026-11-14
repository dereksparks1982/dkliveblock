# Build 407 / v0.3.367: Facebook pipeline diagnostics via existing source components

**November 13, 2026. GitHub main only.**

Existing `src/facebook-diagnostic-report.js` already collates the complete vendored MIT Sponsored-post scanner's counters with the DK-owned GraphQL Nesty 05 interception counters. This build **reuses that data collection path** instead of creating a separate observer, engine or extension permission.

The existing explicitly invoked, same-tab diagnostic export gains a fixed, frozen aggregate pipeline with five fields: `dom`, `graphql`, `focus`, `verified:false`, `scope:"aggregate-only"`. It differentiates: extension/core inactive; core not initialized or observer missing; DOM label unanchored or anchored-without-hide; late SPA retries; GraphQL unavailable/disabled/unsupported; no GraphQL responses yet; responses observed but unmodified; modified records; errors, timeouts, oversize or capacity skips. No single category means a specific Facebook ad was actually blocked. Legacy report schema `2` remains supported, and the existing UI renders the full report JSON without a new translation surface.

No new logging, URL capture, post text, cookies, account data, remote AI, profiler, scripts or request hook. There are 15 new bounded synthetic tests and no changes to Facebook/YouTube filtering behavior, page allowlists or user controls. Live Firefox owner verification is still needed.
