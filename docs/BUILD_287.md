# Build 287 / v0.3.257: Facebook DOM live evidence-to-Nesty bridge
**Date:** November 2, 2026. **Branch:** `main`. **Release:** internal, owner acceptance pending.

The existing Facebook DOM scanner still verifies ad evidence and independently decides hide, restore and exceptions. Only successful DOM hides emit one fixed kind (feed, menu, rail, Marketplace) to Nesty's in-page coordinator. Counts are capped at 10,000 per category. The adapter never sends DOM elements, URLs, post text or account identifiers to Nesty; no telemetry or automatic network rules. Nesty's existing strategies remain explicitly disabled and non-executable.

The existing Firefox Facebook detector diagnostic response can now report local evidence and inert reviewed strategy names; no interface geometry, user preferences, network permissions or GraphQL experiment behavior changed.

Two native test cases cover scope, bounds, disabled strategies and source wiring. User confirmed DK Live Block working on Pornhub; no exact ad surfaces, playback duration or version was specified, so the verification ledger preserves that limited observation.

**Validation:** JavaScript syntax and isolated coordinator V8 smoke checks before commit. Complete native Ubuntu and Firefox behavioral checks still pending. No release, zero-ad-flash or competitor-parity assertion.
