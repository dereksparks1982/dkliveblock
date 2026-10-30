# DK Live Block: YouTube maintenance playbook

This project is unreleased. Remote YouTube compatibility updates are limited to **filter data**, never executable JavaScript or scriptlets. Firefox Add-ons requires extensions to be self-contained, so JS engine, detection algorithms, and permissions must ship in reviewed extension updates.

## Fast rule fix without a new add-on version
1. Reproduce the change against the current filter list and a real Ubuntu Firefox session, with YouTube logged in and logged out. Check video player controls, captions, normal navigation and Google sign-in. Avoid collecting account data, cookies or personally identifying information.
2. Edit only `filters/youtube.txt` in the public `dkliveblock` repository. Raise `! DKLB-YouTube-Pack: <number>` by one. Use simple YouTube-scoped ad selectors; the validator rejects network rules, global selectors, unscoped CSS, `#?#` procedures and `+js` executable snippets.
3. Run the local tests, including `node --test tests/youtube-maintenance.test.js tests/youtube-background.test.js` and the complete `bash scripts/test-local.sh`. **No GitHub Actions, external runner or password prompts.**
4. Review the changed source snapshot and commit/push normally. The hosted raw text at `https://raw.githubusercontent.com/dereksparks1982/dkliveblock/main/filters/youtube.txt` is the update address. Do not publish an extension ZIP for a data-only update.
5. When the next daily check runs, enabled clients attempt a conditional HTTPS download. Version, size, filter scope and selector safety are validated before the rules are activated. If unavailable or invalid, the last-known-good rules remain active; built-in seed rules remain a fallback.
6. Users can view version/status in Settings > YouTube compatibility updates and press **Check YouTube rules now**. **Roll back YouTube rules** restores the prior accepted pack, or built-in baseline if no prior pack exists. The rejected version cannot silently reinstall; publish a newer pack version to resume updates.

## When the website changes behavior
| Possible change | DK response |
| --- | --- |
| YouTube renames ad container classes | Increment and ship the data-only compatibility pack after browser validation. |
| YouTube renames Skip Ad button or changes page DOM state | Update `src/video-assist.js`, add fixtures, submit a normal Mozilla-reviewed extension update. |
| The ad is stitched into video playback on the server | A CSS filter cannot surgically remove it. Preserve playback and investigate feasible noninvasive alternatives; do not claim guaranteed removal. |
| The site detects adblockers or uses delayed enforcement | Validate the anti-adblock overlay handling, preserve legitimate dialogs and sign-in, and ship a reviewed code fix if needed. |
| A pack hides legitimate content | Use rollback immediately, diagnose locally, publish a newer version after tests. |
| Browser or extension API changes | Update the extension code and review permissions/MV2 compatibility; Mozilla signs the extension update. |

**Privacy:** DK does not collect viewing history or report video failures to a server. Raw GitHub hosts do receive ordinary connection metadata during list downloads. Downloaded text is treated as untrusted data and filtered by an explicit allowlist.

## Build 41 playback-control regression guidance (0.3.12)

The built-in YouTube assistant is **not** a video-stream rewriting system and does not guarantee server-inserted ad removal. It may click only an eligible, visible Skip Ad control. It rejects recycled controls with non-ad labels, button states that are disabled or hidden by CSS, and unrelated Skip Intro/Next Episode controls. The watcher observes recognized skip controls and uses a bounded list of DOM mutations. Page-side periodic fallback already exists; do not add a second repeating poll.

When testing in Firefox, record the extension version, browser version, selected YouTube host (www, mobile or nocookie), playback/ad type (preroll, midroll, short/non-skippable), whether the Skip Ad button became enabled, whether it was clicked, whether playback continued normally and whether sign-in/controls remained functional. Inspect the Network Monitor only with user consent; do not attach sensitive YouTube URLs or account tokens to a bug report. Report reproducible issues through [SUPPORT.md](../SUPPORT.md).

This is a manual validation checklist, not a claim of completed live YouTube testing.
