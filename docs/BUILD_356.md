# Build 356: extended 32-build checkpoint

**Version:** 0.3.326. **Date:** 2026-11-03. **Status:** unreleased source checkpoint.

## Scope
Builds 325–356 add bounded Facebook feed, right-rail, Marketplace and mobile scanning fairness, preserve transient explicit Sponsored evidence, enforce edit and independent-post safety, expand privacy-sanitized diagnostics, handle request races, and repair cumulative regression fixtures. English and Russian README introductions now use the same approved neon banner and clearly mark Facebook and YouTube acceptance as pending.

## Verification status
- Source-only GitHub commit, version agreement, manifest privileges and registered tests are checked. The local read-only auditor reports an explicit false for full Ubuntu acceptance, live Firefox validation and public release approval.
- Targeted isolated V8 test harness and case-specific smoke runs passed where reported, but the complete native Node/Ubuntu suite has **not** been run here.
- Real Facebook ordinary feed/right rail/Marketplace/mobile sponsored removal remains unverified in Firefox.
- Ordinary YouTube video anti-adblock interruptions and separately ad-funded movies require matched playback tests; the new diagnostics make **no** ad-free claim.
- Orion iPhone extension behavior, page reflow in supported Pornhub layouts, Disney+/CBS playback and site-specific login safety require owner acceptance.

## Follow-up acceptance gate
First run the native test suite on Ubuntu; compare the exact installed version against 0.3.326, then evaluate Facebook ordinary vs sponsored posts on feed/right rail/Marketplace/mobile, and compare ordinary YouTube and Free-with-Ads films without guessing whether no ad was scheduled. Keep releases and Git tags withheld until user-approved browser acceptance. No new GitHub Actions triggered, site permissions expanded or UI geometry moved in this run.
