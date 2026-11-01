# DK Live Block — next-thread handoff

**Updated:** 2026-11-01 (America/Chicago)
**Status:** DEVELOPMENT / UNRELEASED. This is a handoff and issue record, **not** a claim of a working CBS fix or a release.
**Read this file first in the next conversation.** Then consult `README.md`, `docs/STATE.md`, `docs/QA_LAB.md`, `docs/ROADMAP.md`, and `docs/RELEASE_WEEK_2026-11-01.md`.

## Repository position verified on GitHub

- **Repository:** `dereksparks1982/dkliveblock` (public).
- **Default working branch:** `main`.
- **Current latest source commit observed before this documentation handoff:** `f384aad873f823380a802c03f13b4fc2011b969d`, "Build 229: update CBS autoplay regression for homepage coverage".
- **Extension source version:** `0.3.199` in `src/manifest.json` (Build 229).
- **Build 229 source change:** `4f018664b51e982e6f417cfbf7b0fd89b339e68c`, "repair CBS video and temporary element picker; add Pages landing"; followed by homepage-guard and test commits `0a01c67` and `f384aad`.
- Previous Build 228: `fbc462f7782077f79d9e64c8a199bb81cdb1e6d0`.
- The README and site are present, with `index.html` and `docs/index.html` containing the GitHub Pages homepage.
- **Limit of verification:** these facts describe GitHub's remote contents; this handoff did not inspect the owner's Ubuntu checkout or prove it has no local uncommitted/unpushed changes. Do not claim local/remote synchronization without checking the owner's machine.

## Critical owner instructions for the next conversation

1. **Do not inspect, code, test, commit, or build unprompted in voice discussions.** The owner will explicitly say **"build"** when development should proceed. This handoff-only documentation update was specifically requested.
2. The owner decides product behavior and the timing of publication. Do not present Mozilla's Add-ons store criteria as control over the product's design. Packaging/signing/install requirements are a separate technical distribution question.
3. Do not use GitHub Actions or hosted CI; local-only checks. Preserve `main` and approved baselines. Do not create surprise releases, ZIPs, change UI layouts, or auto-open browsers.
4. Keep existing successful CBS page ad filtering and the prior owner-observed YouTube/Disney+ progress intact. A regression or an offline test is not proof of real playback.
5. Clear, direct status reporting. Never say a real-world video issue is fixed until the owner reproduces successful playback in Firefox.

## MOST URGENT: CBS News black/hidden/unplayable player

**Owner's latest test after reloading the extension and CBS page on Build 229:** the **CBS News homepage video on the right is still black and cannot be played.** This is an **open, confirmed owner-reported failure**, not fixed.

Related symptom: CBS News article videos were hidden or stuck with an endless loading spinner when the extension is enabled; autoplay suppression must not turn into blocking the underlying video. The homepage player can remain visible as a black rectangle but still fail playback.

What was attempted:
- Build 227/228 introduced and adjusted autoplay suppression and trusted player-gesture handling.
- Build 229 added a narrow CBS player-configuration allow decision for `doppler-config.cbsivideo.com`, player-container cosmetic protection, CBS legacy picker cleanup, and CBS homepage click-to-play coverage.
- Focused offline regressions were reported, but **the owner's browser retest still fails**. Avoid declaring the issue closed.
- Potential distinct causes to investigate *once authorized*: requests/configuration still blocked; CSS or saved cosmetic rules hiding the player; cross-frame/overlay click recognition; a replacement video element losing permission; or other player initialization failures. These are hypotheses, not confirmed diagnoses. Do not globally allow CBS ads to restore the player.

**Required CBS behavior:**
- Homepage and article video players remain visibly present after page load/refresh.
- They do **not autoplay**.
- An explicit user click starts playback promptly; no black box, hidden player, or infinite spinner.
- CBS's intrusive ads and its seemingly endless ad-heavy page remain suppressed. The owner directly compared blocker OFF (ads everywhere, long ad wall) against ON (much cleaner/usable page). **Preserve this positive result**.
- Real Firefox acceptance, preferably with precise source version, is still needed.

## Block Element: exact intended behavior

The owner explicitly and repeatedly clarified this; do not reinterpret it:
- **Manually hidden elements must NEVER be saved by the Block Element picker** to persistent site rules, storage, custom filters, or any other setting.
- **Reloading the webpage immediately restores every manually hidden element**, with ad/tracker filtering still active.
- Do **not** require Undo, reset, or disabling the blocker to get picked elements back after a refresh.
- Earlier builds saved selections into custom cosmetic rules, including one that hid the CBS video player. Build 229 attempted to stop all future picker persistence and migrate/clear legacy CBS picker rules. Whether the owner's remaining missing/black player is caused by old persisted picker data, ordinary filters, or a separate playback bug is **not established**.
- The user verified that the picker itself successfully hides elements, and earlier noticed that old hides persisted after refresh. New-session behavior needs real-browser verification.
- Explicitly authored **custom filters** and separate per-site exception settings are different features; do not silently wipe those while addressing picker-created selections.

## GitHub Pages and public download: owner decision

**Site:** https://dereksparks1982.github.io/dkliveblock/
**Site source:** `index.html` and `docs/index.html`.

The website currently shows three prominent links:
1. **"Download source ZIP" must point to the owner's public Google Drive download**, not to a GitHub source-archive URL. This is the owner's explicit design requirement.
2. **"GitHub repository" must point to:** https://github.com/dereksparks1982/dkliveblock
3. **"Support on Patreon" must point to:** https://www.patreon.com/c/dkliveblock

**Known defect:** the current "Download source ZIP" button links to `https://github.com/dereksparks1982/dkliveblock/archive/refs/heads/main.zip`, duplicating GitHub as the destination. The owner strongly rejected this.

**Google Drive deployment is NOT complete:** no confirmed public Google Drive file ID, public download URL, or uploaded/tested distributable was supplied in this conversation. Do not invent one, claim a Drive file exists, or silently substitute GitHub. When the owner authorizes this work, acquire/verify the actual file and public share URL and update the site accordingly. Preserve distinct destinations. The owner wishes to distribute outside the Mozilla Add-ons store before store approval; distinguish an unpacked source ZIP for temporary developer loading from a normally installable, valid Firefox extension package. Do not mistake "not in the store" for guaranteed exemption from Firefox signing requirements.

Site should contain relevant product information, current capabilities/limitations, truthful installation steps, downloads, GitHub, Patreon, and support details. Existing site is a starting point, not accepted final distribution.

## User-observed successes worth preserving

- Turning DK Live Block ON dramatically improves CBS News page clutter and removes many ads; OFF reveals intrusive ads and a long, continually scrolling ad-heavy section.
- Manual element picking can successfully hide chosen elements.
- Patreon link/button was reported working.
- Prior sessions recorded positive site-specific results on YouTube ordinary videos and ad-supported movies, Disney+ movies/CSI: Las Vegas, and intrusive popup/ad suppression on 1337x and The Pirate Bay. Such observations do not prove all ads or contexts are covered. See `docs/RELEASE_WEEK_2026-11-01.md`.
- The present **CBS video playback failure overrides any assumption that Build 229 solved CBS**.

## Next authorized work, in order

**Do nothing further automatically after documenting this handoff. When the owner explicitly directs a build:**
1. Reproduce/debug the CBS homepage black player and article player behavior without sacrificing existing CBS ad suppression. Compare ON/OFF network/video initialization and embedded frame/click handling; avoid broad allowlists. Fix and test both player contexts.
2. Verify the picker does not persist **any** manual selection and that a page reload restores it. Audit legacy CBS picker artifacts without deleting intentional custom rules.
3. Obtain or verify the real public Google Drive file/share link for the download, then change the **first** Pages button to that destination while keeping GitHub and Patreon buttons separate. Do not fabricate a working download link.
4. Run focused offline tests and the complete `bash scripts/test-local.sh` suite locally where permitted; record exact build SHA and results. No GitHub Actions.
5. Have owner retest in Firefox: CBS homepage right-hand player; CBS article videos; no autoplay; manually click Play; check ad suppression; hide element then reload. Record actual outcomes.
6. Only then consider release packaging, truthful installation language, signing/distribution, and separate AMO review. No release or parity claim without the owner's acceptance.

## Handoff caution

The older `docs/STATE.md` header still names Build 220; it is historical/stale compared with the actual `src/manifest.json` Build 229 version. This handoff captures the latest 2026-11-01 conversation and supersedes stale opening status lines **for the specific CBS/Pages/picker issues above**. Use repository source and current Git history for actual code details. Do not treat this document as new code or a fresh build.
