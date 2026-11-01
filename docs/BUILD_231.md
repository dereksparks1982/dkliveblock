# Build 231 (0.3.201): CBS player compatibility, popup consistency, local AI v2

**Development build.** CBS live Firefox playback remains unverified, so a successful black-screen repair is not claimed.

## CBS News playback

- Preserve three narrowly identified player dependencies reported in uBlock Origin CBS News unbreak rules: exact HTTPS `tealium.cbsnews.com/site/prod/utag.js` (script), `imasdk.googleapis.com/js/sdkloader/ima3_dai.js` (script) and `ima3_dai_debug.js` (script). Retain existing CBS Doppler configuration exception.
- All manual site/type blocks and threat decisions run first. No exception for general Google IMA ad delivery, DoubleClick, Tealium analytics, video ads or unrelated websites.
- Stop the old CBS autoplay controller from altering autoplay, pausing videos or capturing player clicks, since the owner observed video flashing briefly and then becoming black/unresponsive. This means CBS native autoplay is presently controlled by CBS itself.
- Protect identified CBS/JW player play/control selectors from automatic cosmetic hiding on CBS News and CBS video iframe hosts, without exempting generic ad containers.
- External research: uBO uAssets `unbreak.txt` CBS rules and July 2025 community confirmation that allowing the Tealium player bootstrap restored iframe videos. Our outcome is not yet confirmed.

## Popup

- Set **View blocked** and **View allowed** to the same 101 x 34px box, with identical padding, font size and right alignment. No other popup layout changes.

## Local adaptive AI

- Upgrade the built-in YouTube playback fallback's 6-input, 128-case synthetic classifier to a **7-input, 256-case offline-trained classifier**. The new input is `sawAdShowing`; if actual ad state is observed, it cannot recommend weakening the existing page bridge.
- Reproduce training with the standard-library-only squared-hinge single-neuron trainer. Input fields are bounded boolean/counters, synthetic fixtures only. Model scores are not calibrated real-world probabilities.
- The model remains advisory behind the existing deterministic guard. It cannot auto-allow advertising domains, turn off blocking, import code, collect browsing URLs, or transmit anything.

## Validation

- Focused CBS and AI Node tests passed in the local workspace.
- Full seven-phase offline test runner was attempted; it currently reports existing/repository-wide failures. No full-pass claim or public release.
- **Owner acceptance:** in Firefox reload the updated temporary extension and revisit CBS News homepage and article video; verify clickable player, working playback and no visible advertising. Also visually check the two popup buttons.
- `main` only, no GitHub Actions, no external runtime dependencies, no download package, no README handoff/build clutter.
