# DK Live Block Build 44: protection-first defaults and safe distraction cleanup

**Version 0.3.15 · UNRELEASED development source · 30 October 2026**

## Actual changes
- New-installation defaults enable all five existing curated ad/tracker/cookie/annoyance/social filter subscriptions, plus explicit cookie rejection and the new distraction-control toggle. Existing saved preferences, including disabled filters and switches, remain authoritative.
- A clearly identified Reject All, Decline All or Necessary Only consent control may be clicked only inside a verified cookie notice with safe visibility, disabled-state and accessible-label checks. Ambiguous and conflicting Accept/Reject labels are ignored. Supported conservative labels now include Russian, Chinese, Arabic and Welsh alongside previous languages.
- An independent bounded, reversible classifier handles newsletter signup prompts, survey requests and corner advertising wrappers. It requires an overlay, strong textual/class signals and positive visibility, and refuses anything containing active video/audio, embedded media frames, login/security/checkout controls, or fullscreen content.
- The per-feature option is available in Settings, with conservative defaults. The content-side observer uses the existing debounced overlay scan, without a new interval, analytics, third-party engine dependency or additional Firefox permission.
- Local, source-level tests added/updated for defaults, persisted opt-outs, multilingual labels, sensitive controls and conservative distraction filtering.

## Important limitations
- Fanboy/EasyList filters only protect after an actual successful update. A fresh offline install falls back to built-in protection; do not promise the remote lists are prepackaged.
- This build intentionally **does not disable native Firefox permission prompts** or hide active floating-video players, because doing so generically could damage legitimate media and violate browser permission boundaries.
- Textual classification does not reliably distinguish a user-initiated signup form from all unsolicited overlays. Strong signals, reversible hiding and an opt-out reduce risk but live Firefox tests are still needed.
- Automatic browser-language list downloads and comprehensive multilingual filtering are not finished.
- Complete Node/Python regression suite, Firefox installed-extension tests, YouTube/Disney+ ad/playback and ABP parity remain outstanding. No public release or GitHub Actions.

See the [roadmap](ROADMAP.md), [parity checklist](ABP_PARITY_CHECKLIST.md) and [bug-reporting instructions](../SUPPORT.md).
