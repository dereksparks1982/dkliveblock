# DK Live Block: localhost manual QA lab

This test page contains fake ads, not real ad-network requests. It tests display hiding and restoration, never YouTube, Disney+, DRM, third-party downloads, or Adblock Plus parity.

When a local Firefox check is authorized, run python3 scripts/qa-lab.py inside a DK Live Block source checkout. The Python standard-library server binds only to 127.0.0.1:8765 and prints the lab URL. It does not automatically open a browser. End with Ctrl+C.

Checks: default ad markers should disappear; a dynamically inserted ad should disappear shortly after clicking its button. Open and nested Shadow DOM ad markers should also disappear. A closed Shadow DOM fixture should remain. A sponsored article, sign-in form, ad-labelled content nested inside a form/article, and video controls must remain usable. After pausing protection for 127.0.0.1, prior hidden slots should reappear. Resume, then repeat. Cookie reject/accept fixture buttons are recorded visibly, and no unintended acceptance should occur.

This is a convenience fixture only. Run the full local regression suite and all real Firefox, YouTube, Disney+, cookie-consent, login, popunder, performance, filter-update and license checks before approving release. Never publish private browsing logs.


## First-test sequence and recording

Do not package or publish until the complete offline suite succeeds. When the user decides to test, use an unpacked Firefox development profile and inspect the add-on toolbar and Site Dashboard first. Check a normal news site, an untrusted popup-heavy site (no automatic new tabs), a signed/download link, a cookie rejection example, a legitimate sign-in and a video player in that order. Then perform YouTube playback cases and Disney+ only where the user's account and Linux browser are supported. Keep only hostname-level diagnostics. Mark a failed control, missing script, crash, major performance regression, accidental Accept All or video corruption as **blocking**. Unverified results are **not passes**.

The current readiness gate and results template are in docs/TEST_CANDIDATE_GATE.md.


## Manual Firefox observation: 1337x forced-tab prevention (November 1, 2026)

**Status: PASS for the specific user-observed behavior; not a full popup regression pass.**
The user tested DK Live Block enabled on a 1337x mirror and observed an advertising-page attempt to open a new tab and pull focus away from the current tab. With DK Live Block enabled, the unwanted opening/focus switch was successfully prevented. This is **user-reported live Firefox behavior**, not a claim derived from the blocked-request JSON.

**Host disambiguation:** The user verbally identified `1337x.tw` (typed once as `1137x.tw`), while the accompanying exported blocked-request report identifies `1337x.la`. Preserve both observations without treating them as the same verified host or asserting a redirect.

**Independent report evidence:** The JSON captured at `2026-11-01T09:35:49.816Z` identifies website `1337x.la`, hybrid filtering, and 17 blocked network requests (all 17 retained/exported). Matched sources include EasyList, EasyPrivacy and Fanboy Annoyances. The JSON does **not** contain a distinct new-tab interception or popup history event, so it cannot alone prove which guard prevented the forced opening.

**Development candidate:** Testing occurred after the Build 214 (v0.3.184) local-update instruction. The JSON itself does not carry an extension version or commit SHA; treat the exact tested revision as **user-context inferred, not export-verified**.

**Next acceptance checks:** Repeat against both named mirror hosts when convenient, confirm a normal user-authorized new tab still opens using the explicit permit, verify strict blocking when enabled and no unintended blocking after pause/allowlisting, and inspect popup history/count separately. This single successful observation is not evidence that strict protection works on all sites.
