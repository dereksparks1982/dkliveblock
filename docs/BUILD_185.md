# Build 185: first dormant adaptive YouTube playback defense

**Unreleased development source:** v0.3.155 (2026-11-01).

## Design: preapproved defenses instead of fragile individual rules
DK already contains several distinct, reviewed YouTube filtering paths: an extension response filter, a MAIN-world page bridge, a read-only observation mode and a manually controlled test switchboard. Build 185 adds **a finite local strategy controller**, not a downloaded or generative AI engine.

## Actual behavior
- `src/adaptive-youtube.js` records coarse, nonpersistent tab/official-YouTube-host playback-failure counts only; it never stores videos, exact URLs, titles, cookies, page content or media bytes.
- If two separate `buffering`/`media-error` health reports occur at least 20 seconds apart within two minutes, **and** one is associated with locally recorded blocked media, enable a temporary **response-only** fallback. This temporarily disengages the more invasive page-world bridge while preserving the normal network blocker, the extension's bounded YouTube JSON response filter, user site settings and existing manual request controls.
- The fallback expires after ten minutes; the existing default `combined` mode resumes. A tab/site switch, closing the tab, or a manual experiment-mode selection clears the state.
- This behavior is gated by existing private playback diagnostics (`requestLog`), active site protection and `youtubeResponseFilter`. When those are off, there is no adaptive strategy switching.
- No future code is generated or downloaded. No untrusted page signals can choose a new script or grant a broad network allowlist. A user-selected experiment mode always outranks adaptive choices.
- Status exports include only `{active,mode,expires,reason}` for the current tab so the user can tell when a fallback was selected; never raw video identifiers.

## Verification
Added `tests/adaptive-youtube.test.js` with six regression scenarios for trigger conditions, blocked-media correlation, cooldowns, TTL, site isolation, bounded memory, manual override and script load order.
Ran the **actual module** in an isolated JavaScript harness: 15 behavioral checks passed, including ten-minute expiry and disallowed signals. Background/manifest sources passed syntax and load-order checks.
The full Ubuntu Node/Python repository tests and actual Firefox YouTube ad playback **were not run**; the local test environment cannot currently resolve GitHub to clone the repository. Do not claim the switch improves YouTube ad blocking or restores playback until direct browser testing.

## Longer-term AI architecture
A future optional, local AI classifier could identify **which known strategy** is appropriate based on privacy-preserving summarized evidence. The deterministic safety controller, site scoping, bounded mode library and rollback must remain authoritative. Do not deploy speculative AI-written scripts or change defenses based only on ad counters.

**Next Build 186:** add measurable strategy-effectiveness feedback and safeguards against repeated fallback cycles, improve observability with zero private URL disclosure, and expand differential filtering tests. No GitHub Actions, public release or installation prompts.
