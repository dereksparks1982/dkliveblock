# Build 168: controlled YouTube compatibility test modes

**Unreleased v0.3.138. No Firefox acceptance claim.**

The Site Dashboard has a collapsed YouTube-only test section. It changes no existing control positions. On a selected active YouTube tab it can enable four **temporary, tab-local** modes:

- **Normal / combined:** existing response filtering and page-world bridge both enabled.
- **Response only:** Firefox response JSON filtering enabled; page-world bridge disabled.
- **Page bridge only:** page-world fetch/XHR and existing bootstrap handling enabled; Firefox response rewriting disabled.
- **Observe only:** both JSON rewriting methods disabled. The page-world bridge reads coarse bootstrap availability without changing player data. Ordinary DK network blocking remains enabled, so this is not equivalent to uninstalling DK.

Modes are set only from a trusted extension interface for the actual, current YouTube tab, expire after one hour, and are dropped on tab close or domain change. Switching clears the current per-tab YouTube response/playback counters and asks the content script to refresh. **The user must reload the YouTube tab before each comparison**, because document-start data already processed cannot be undone retroactively. Explicit global YouTube-response disabling still takes precedence.

The same existing YouTube report now identifies the selected mode. No browsing URLs, video titles, account data or raw player payloads are stored by this feature. It does not add remote scripts, host permissions, telemetry, GitHub Actions, downloads or public distribution.

**Test protocol for the owner (when ready):** With request diagnostics enabled, first record a normal video and an ad-supported movie under Normal; then repeat with Response only, Page bridge only, and Observe only, reloading before each run. Export the YouTube compatibility JSON for each attempt. Record whether the video starts, ads appear, an anti-adblock warning appears, or playback stalls. Then repeat one control video with DK disabled, optionally uBlock Origin alone. No confirmation of real-browser success is asserted until these observations exist.

**Verification to date:** Source syntax and isolated synthetic probes only. The complete Node/Python Linux suite and controlled Firefox playback matrix have not been executed.
