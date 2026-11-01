# Build 157: localized and title-only YouTube Skip Ad controls

**Unreleased development version 0.3.127, October 31, 2026.**

The YouTube mutation watcher had a broader set of explicit ad-skip labels than the actual click controller. Certain translated and alternative labels could trigger observation, but would not be found by querySelectorAll during the resulting scan. This build aligns the controller's candidate selectors with recognized skip-control vocabulary and adds a bounded set of title-only Skip Ad/Ads/Commercial/Advertisement buttons.

The existing isAdSkip guard remains mandatory: the button must be visible, enabled, safe to activate, in an ad context if not a dedicated ad button, with no conflicting text/aria/title label and no ordinary Skip Intro/Next Episode action. Does not modify media, DRM or signed playback data, and cannot skip an ad unless the site actually offers a visible Skip Ad control. Focused tests assert that the scan selector matches these labels and excludes unrelated controls.

No new dependencies, permissions, remote code, interface moves, CI/Actions or public release. Full local suite and real-browser validation pending.
