# Build 167: initial YouTube player-data visibility

**Unreleased 0.3.137, 2026-10-31.**

## Problem
The existing first-party YouTube response filter counts player API requests, but does not tell whether initial `ytInitialPlayerResponse` data existed before the MAIN-world bridge's current bootstrap pruning. First-load ads and enforcement remain unproven.

## Implemented
- `youtube-page-bridge.js` observes the bootstrap **without invoking accessors**, at first enable before and after existing pruning, then at 1 and 3 seconds. A repeat enable for SPA navigation does not overwrite the first-enable before/after categories.
- The observation includes only phase (pre/post/late), state (absent/data/accessor/other), number of recognized ad fields (0-3), a boolean refusal signal, and whether an own data `ytInitialData` property exists. No page HTML, player payload, ID, title, session token, path or URL is collected.
- `content.js` forwards the coarse observation only when already active on the top YouTube frame and local request diagnostics are enabled, with fixed value validation and an eight-message limit per page lifetime. The webpage can spoof these events; they are informational and never authorize blocking changes.
- `background.js` requires a valid, currently matching first-party YouTube tab, top frame, enabled protection, local diagnostics and existing response filtering. `youtube-response.js` keeps at most four ephemeral per-tab phase observations, updates by phase, and clears them with existing tab navigation cleanup.
- Existing YouTube compatibility TXT/JSON exports now include only those coarse observations. No new upload endpoint, permissions, downloads or user-interface geometry.
- Added unit tests for privacy, bounds, deep-copy and clearing, before/after probe sampling, hostile page accessors, and scrubbed report export.

## Limits
This is **diagnostic evidence, not a new ad-blocking or anti-enforcement method**. Page-world reports are untrusted as authoritative evidence. It does not yet prove a bootstrap race, fix any YouTube refusal, or establish playback parity. Targeted JavaScript syntax and an isolated probe smoke test were run; the complete Node/Python local suite and real Firefox YouTube test matrix remain unverified. No GitHub Actions or public release.
