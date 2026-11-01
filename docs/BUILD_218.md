# Build 218: local YouTube A/B evidence lab

**Version:** 0.3.188 (unreleased development source)  
**Date:** November 1, 2026  
**Protected YouTube baseline:** Build 203, unchanged.

## Purpose

Find out **why ordinary YouTube videos can fail while an advertising-supported movie may still play**, without rewriting a working player route based on guesses. The existing logs include page-world ad-state observations, response-filter attempts, JSON changes, stream attachment errors, blocked-request counts and playback faults. Those are valuable evidence, but they can be misleading when taken alone.

Build 218 introduces an accessible, offline comparison workflow for two voluntary DK Live Block YouTube diagnostic JSON reports, plus optional manual observations of playback and visible ads. This is a **diagnostic tool, not an ad-removal fix**.

## Source changes

- `src/youtube-lab.js`: bounded, standalone privacy-first report projection and A/B comparison. Accepts only the existing YouTube report schema v1, valid YouTube hostnames, known test modes, bounded integer counters and no more than 30 valid playback-event records.
- `src/youtube-lab.html`, `src/youtube-lab.css`, `src/youtube-lab-ui.js`: local interactive lab. User selects two reports of at most 750 KB each and clicks **Compare reports**. Optional typed-in observations distinguish ordinary videos, ad-funded films and Shorts, whether video actually played, and whether an ad visibly appeared.
- The Site Dashboard now links to the lab near the existing YouTube export buttons. No existing control or approved design element was relocated.
- A local-only sanitized JSON comparison export contains just the validated counter deltas, mode labels, evidence warnings and user-entered observation enums. Original hostnames, tab IDs, video URLs, IDs, list entries, comments, cookies and request payloads do **not** enter the comparison output.
- The report is strictly read from a browser-selected file; nothing is uploaded or automatically saved. **Clear reports** erases the in-memory comparison state and clears selected inputs.
- `tests/youtube-lab.test.js` added to the existing seven-phase local Ubuntu suite.

## Interpretation rules

- A lower `ad-showing` count does not establish a blocked ad. The page event originates in untrusted page-world conditions.
- `modifiedResponses` only says known player JSON was changed. It says nothing about whether the ad appeared or the video was usable.
- A skipped ad is not an ad blocked, and no playback event may indicate missing data rather than successful playback.
- Counters are bounded history snapshots, not normalized by session length or the number of advertisements offered.
- When reports differ in site pause, enabled protection, filter backend, response-filter support, request logging or test-mode identity, warnings identify the mismatch. Different modes alone do not establish causality.
- Manual reported playback and ad visibility remain **user observations**. A movie comparison must be run under matched Firefox/account/session conditions before any conclusion.
- The A/B outcome object permanently returns `verifiedAdFree: false`.

## Verification and acceptance

**Checked in isolated tool runtime:** JavaScript syntax for new files, validated exact schema and comparison examples, manifest/package version consistency, privacy checks on source output.

**Not yet run:** Full seven-phase Node/Python suite against the exact Build 218 source tree, or any real Firefox/A/B playback experiment. No claim that ordinary YouTube ads were removed or that existing playback issues are repaired.

**Firefox acceptance matrix:** with all competing blockers disabled, compare equivalent lengths of (1) a regular video with preroll, (2) a midroll, (3) an advertising-supported film, (4) Shorts, and (5) a normal video without a preroll. Record separate observable ad appearance and actual content playback. Save a report only when the user chooses, compare two matched attempts in the local lab, and share sanitized summaries voluntarily. Verify false positives, exception behavior, browser restart, Firefox private contexts, memory use, and no uploads.

**Next:** Use repeatable evidence to isolate one concrete filtering or player fault. Keep working Build 203 rollback safe, do not execute subscription-provided scripts, and do not automatically disable protective filters to force playback.

No GitHub Actions, no added permissions, no downloadable extension or native dependency, no release authorization.

If comparing an ordinary video against an ad-funded film, both video types must be labeled independently. The UI warns that different content types are not a controlled A/B comparison.
