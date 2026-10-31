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
