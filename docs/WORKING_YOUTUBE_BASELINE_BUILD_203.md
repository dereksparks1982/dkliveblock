# DK Live Block: observed-working YouTube baseline (Build 203)

**Date:** 2026-11-01 (America/Chicago)
**Source version:** 0.3.173, Build 203
**Exact tested commit:** `8f4c6739ddba2cbb1a64918639d014ccf31a8f54`
**Preserved branch:** `snapshots/build-203-youtube-working-2026-11-01`
**Recommended annotated local tag:** `youtube-working-build-203-2026-11-01`

## User-observed behavior on Ubuntu/Firefox

These are initial manual observations, **not a comprehensive compatibility or competitor-parity certification**.

- An updated Firefox installation was loaded from the local repository after a successful fast-forward update to the exact Build 203 commit.
- The user tried numerous ordinary YouTube videos and reported that they played normally without seeing ads or the prior disable-adblock playback refusal.
- Toggling DK Live Block **off** and refreshing the same YouTube page caused an advertisement to appear; with DK Live Block **on**, the user observed no such ad. This provides direct on/off evidence for at least one YouTube ad.
- The user also compared YouTube's sponsored right-column placement and saw it with DK Live Block off, but not with it on. Normal video recommendations remained.
- A movie offered with advertising began playing; the user described a short startup delay (usually under about three seconds on other videos) as acceptable. Movie-wide ad removal and every midroll opportunity were **not** systematically checked.
- The visible YouTube "experiencing interruptions" message was sometimes displayed before playback. The user regards the startup time as acceptable; do not prioritize shaving it down at the expense of playback reliability.
- The small breaks in the player seek bar were identified as normal video **chapter separators**, not evidence that DK had stripped advertising markers.

## Anonymized local blocked-request report observation

The user's 2026-11-01T07:41:57Z blocked-request export from a YouTube tab reported:

- **4** blocked requests; **0** media requests blocked.
- One request to `googleads.g.doubleclick.net` blocked by bundled fallback network rule `||doubleclick.net^`.
- Three first-party YouTube XMLHttpRequests attributed to EasyPrivacy; their actual purposes cannot be established from redacted hostname-only data.
- Hybrid filtering backend, combined YouTube experiment mode, first-party response filtering enabled and Firefox API supported.
- **One response-filter error; zero successful response rewrites in that report.** Do not assert that response rewriting itself caused the successful ad blocking.
- No playback diagnostics were recorded in that export.

No video identifiers, watch URLs, account data, user settings, personal viewing history, private report files or URLs with tokens are recorded here.

## Freeze and rollback policy

1. The **exact tested code** is Git commit `8f4c6739ddba2cbb1a64918639d014ccf31a8f54`; the above snapshot branch points to it. This is a development baseline, **not a public release** or approved production build.
2. The user should preserve a locally generated `git archive --format=zip` export of this exact commit under `~/DKLab/Archives/DK-Live-Block/`, together with SHA-256 checksums. For full Git history, also create and verify a Git bundle.
3. Create an **annotated Git tag** `youtube-working-build-203-2026-11-01` pointing to this exact commit, and push only that tag. Do not retarget it if development continues.
4. **Firefox settings are separate from source.** The add-on's Options page has **Settings backup → Export JSON** and **Import JSON**; save a settings export separately in private storage, as it can contain user-specific exceptions. A source ZIP or Git tag does not capture live cached remote filter lists, temporary tab modes, browser profile or cookies.
5. Future builds must not move or rewrite this snapshot. If YouTube breaks, compare the current commit and settings against this baseline first; restoring the source alone may not reproduce identical conditions if YouTube or downloaded lists changed.
6. No GitHub Actions, automatic publishing, or Mozilla release is part of this snapshot.

## Remaining test gaps

Full local Ubuntu suite and live Firefox matrix; midrolls, Shorts, and all ad-funded movie categories; private browsing, other websites, logins and payments; reproduced response-filter error; real parity against uBlock Origin and AdGuard.
