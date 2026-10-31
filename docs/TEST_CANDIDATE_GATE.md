# DK Live Block: first serious Firefox test candidate gate

**Source version:** 0.3.32 (Build 61)  
**Status:** OFFLINE TEST SUITE PASSED. CLEARED FOR SUPERVISED MANUAL FIREFOX TEST ONLY. NOT PUBLIC RELEASE  
**Platform:** Ubuntu/Firefox · No GitHub Actions · No automatic browser launch

## Offline source acceptance

| Requirement | Status | Evidence |
| --- | --- | --- |
| GitHub source commit and matching manifest/package version | PASS: `4948729`, v0.3.32 | GitHub main, desktop pull and version test |
| No GitHub Actions or remote packaging | PASS | Local test output, phase 1 |
| Node source and test syntax | PASS on Ubuntu | `PHASE PASS: JavaScript syntax` |
| Node regression suite, all test files | PASS: 117 + 320 cases, 0 failures | `scripts/test-local.sh`, local output |
| Python companion and package regression checks | PASS: six unittest modules plus fixture checks | `scripts/test-local.sh`, local output |
| Offline Firefox package audit | PASS: 0.3.32 | `scripts/release-audit.py` output |
| Browser installation, startup and settings persistence | NOT TESTED | Firefox profile test |
| Memory/performance after long session | NOT TESTED | Firefox profiler |
| Video compatibility and ABP feature comparison | NOT TESTED | docs/ABP_PARITY_CHECKLIST.md |

## First manual Firefox acceptance plan

Record results as PASS / FAIL / NOT RUN, with a non-sensitive reproduction note and Firefox version.

1. **Install/startup:** unpacked manifest loads without errors, toolbar opens, site selector works and the settings page saves and survives a restart.
2. **Blocking basics:** observe ordinary page ad slots, trackers and dynamic advertisements; verify main article, login, checkout, download links and page navigation still work.
3. **User control:** globally disable/reenable, pause/resume a tab, allowlist/unallowlist a site, and verify exceptions never carry over to unrelated sites.
4. **Popups and cookies:** exercise unsolicited popunders, the 15-second one-tab override, one explicit Reject All, non-consent dialogs and nested open-shadow banners. Verify there are no auto-accept actions.
5. **Inspection:** Site Dashboard, hostname-only logs, request allowances and their revocation, Network Monitor, element picker and undo. No private paths or tokens in exported diagnostics.
6. **Video:** YouTube pre/midroll, videos without ads, shorts/SPA navigation, subtitles/fullscreen and non-ad Skip Intro controls. Confirm genuine playback remains intact.
7. **Authorized streaming:** Disney+ sign-in, playback and seeking only if available in the tester's Firefox/Linux environment and permitted service tier. Record streaming incompatibility separately from ad-removal failures.
8. **Stability:** repeat navigation and tab switching, run for a meaningful period, observe Firefox CPU/RAM and tab responsiveness, and ensure no unsolicited settings changes.

## Outcome rules

- **Blocking:** failed offline gate, inaccessible toolbar, silent extension crashes, incorrect destructive tab closure, automatic cookie acceptance, login/checkout breakage, or video content corrupted by blocking.
- **Functional gaps:** incomplete filter syntax or non-skippable/server-inserted ads. Record honestly; do not claim Adblock Plus parity until externally compared and accepted.
- **Source ready for a supervised test:** all offline source gates PASS, with the user explicitly choosing to test. This is not a public release.
- **Public release:** separate authorization, passing Firefox acceptance, parity review, final accepted snapshot, annotated tag, Mozilla review/signing and license disclosures.

**No build ZIP, no GitHub Actions and no request for the user to test yet.**

## First real Ubuntu run, October 30, 2026

Desktop fast-forwarded to Build 61. Previous locally modified Ghostery vendor file was saved in a Git stash. Do not reapply that stash over the current bundled engine until reviewed.

The first phase passed suite inventory (90 Node test files and nine Python scripts) and JavaScript syntax checks. It executed 115 structural tests: **112 passed, 3 failed**. All three were historical manifest-version assertions in cosmetic-exceptions-ui, notification-protection-ui and video-quality tests. These assertions now compare against package.json, and a version-contract test guards against future hard-coded manifest versions.

**These corrections must be rerun locally.** The Python, offline regression, packaging, Firefox, streaming and performance gates have not passed yet.

## Second real Ubuntu run (October 30, 2026)

At commit `4cb6d7c`, GitHub Actions absence, the 91-Node/9-Python file inventory, and JavaScript syntax passed. **117/117 structural Node cases passed**, and all six Python companion suites passed. The main offline regression phase ran **320 tests: 314 passed, 6 failed**. Five failures were from test-only Firefox VM fixtures missing `TextEncoder` (`tests/proxy-probe.test.js`, four cases, and `tests/security.test.js`, one). One failure was from the subscription caching test expecting two filter-list downloads when new default settings enable five. The fixes supply the proper web encoding APIs in those fixture contexts and explicitly enable only EasyList/EasyPrivacy within the two-list test, leaving production five-list defaults unchanged.

**Pending:** a fresh complete `bash scripts/test-local.sh` run, the offline Firefox package audit, supervised real Firefox testing, YouTube/Disney+ playback and long-session stability. This is not proof of browser readiness.

## Third Ubuntu run: FIRST COMPLETE OFFLINE PASS (October 30, 2026)

User-supplied terminal log from Ubuntu desktop, checkout `main` at `4948729`: **117/117 extension-structure JavaScript tests PASS; 320/320 offline regression JavaScript tests PASS**. The Linux companion protocol phase completed six Python unittest modules without failures; the extra audit/inventory fixture scripts also passed. The test inventory found 91 Node test files and 9 Python scripts; JavaScript syntax, no GitHub Actions, and Firefox manifest/packaging audit v0.3.32 all passed. Terminal finished with `FINAL PASS: Local source checks; browser and video playback remain unverified`.

**Decision:** Offline source gate accepted for a user-supervised *temporary* Firefox loading smoke test. This is not Mozilla signing, successful Firefox runtime validation, YouTube/Disney+ verification, an approved public release, or ABP parity. The user's altered legacy `src/ghostery-vendor.js` is held safely in a local Git stash; do not reapply it over the current bundled engine without inspection.

### Initial Firefox smoke test without packaging

1. In Firefox manually navigate to `about:debugging`, select **This Firefox**, then **Load Temporary Add-on**.
2. Select `$HOME/DKLab/Projects/dkliveblock/src/manifest.json`. Firefox's temporary extension disappears on browser restart. No ZIP, signing, GitHub Actions, extra install or native companion is needed for base blocking.
3. Verify DK Live Block appears under **Temporary Extensions**, with no red load error. Open the toolbar and Site Dashboard. Test on a benign ordinary website first. Compare with other installed ad blockers disabled for the test, ideally using an isolated test profile.
4. Record: `LOAD PASS/FAIL`, `TOOLBAR PASS/FAIL`, `SITE DASHBOARD PASS/FAIL`, `COMMON PAGE PASS/FAIL`, and any browser error text or screenshot. Do not begin long video/Disney+ compatibility tests until basic UI works.

## Build 63 (v0.3.33): all offline gates PASSED, October 30, 2026

Ubuntu desktop pulled GitHub `main` at `123f8bd` and executed `bash scripts/test-local.sh`. User-provided stdout confirms **126/126 structural Node tests and 324/324 offline regression Node tests**, six successful Python companion invocations, 93-of-93 Node test files and nine Python script inventory checks, JavaScript syntax checks, and Firefox package audit v0.3.33. No GitHub Actions found. **0 failures out of 450 JavaScript tests**.

The icon, click-through individual blocked-item Details and user-triggered RDAP endpoint have passed offline unit/structural checks. The VPN/RUTUBE classifications passed offline source checks. This is not a live Firefox/RUTUBE demonstration or independent domain-registry availability check. Browser test gate remains OPEN: verify toolbar icon instead of puzzle piece, View blocked list and individual Details for real blocked requests, research links and explicitly requested RDAP, ad promo/VPN notice removal without changing VPN or video playback. Do not publish.
