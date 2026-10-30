# DK Live Block Build 41: YouTube player-control safety and regression hardening

**Version 0.3.12 · UNRELEASED.**

### Changes
- Require trusted ad-skip language or an ad-skip context for shortened/unlabelled buttons. Merely having a recycled YouTube ad-skip CSS class is insufficient to click non-ad buttons.
- Verify computed-style visibility, opacity, pointer events and disabled/hidden ancestors, in addition to the existing connected/disabled/rect checks.
- Recognize supported Skip Ad, Skip Advertisement(s) and Skip Commercial(s) aria labels when scheduling mutation-triggered ad scans.
- Avoid materializing entire NodeLists when observing changes. Inspect at most 12 newly inserted nodes per mutation and at most 40 mutation records per call.
- Extend unit coverage for misleading button labels, invisible/disabled buttons, compact ad skip buttons, aria-label changes and extremely large DOM insertions.
- Test review: **26 focused YouTube assistant/watcher tests and six YouTube rule-pack validation tests passed** in a custom JavaScript test harness. These are selective executions, not the complete project regression suite.

### Outstanding
- Run the full `scripts/test-local.sh` Node/Python/release-audit suite in a full local checkout (not performed here).
- Real Firefox YouTube desktop/mobile/nocookie preroll, midroll, non-skippable ads, SPA navigation, cookie and login compatibility.
- Actual Disney+ playback, native download end-to-end, and Adblock Plus parity. No public release, GitHub Actions, optional dependencies or downloads were triggered.
