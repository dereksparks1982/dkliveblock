# DK Live Block: first serious Firefox test candidate gate

**Source version:** 0.3.32 (Build 61)  
**Status:** NOT CLEARED FOR USER TESTING OR PUBLIC RELEASE  
**Platform:** Ubuntu/Firefox · No GitHub Actions · No automatic browser launch

## Offline source acceptance

| Requirement | Status | Evidence |
| --- | --- | --- |
| GitHub source commit and matching manifest/package version | To verify on final commit | HEAD SHA and files |
| No GitHub Actions or remote packaging | Source guard present; independent check pending | scripts/test-local.sh |
| Node source and test syntax | Partial syntax inspection only | Requires complete local checkout |
| Node regression suite, all test files | Not run end-to-end here | scripts/test-local.sh |
| Python companion and package regression checks | Not run end-to-end here | scripts/test-local.sh |
| Offline Firefox package audit | Not run end-to-end here | scripts/release-audit.py |
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
