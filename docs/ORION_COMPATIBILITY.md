# Orion compatibility: one codebase, platform-specific packaging

Status on 2026-11-02: research completed, **DOM-only candidate source implemented**, NOT tested on Orion iPhone, NOT approved as a downloadable release. Main Firefox Manifest V2 engine remains authoritative and unchanged at v0.3.235.

## Verified upstream facts
- Official Orion macOS desktop and iOS/iPadOS browsers: https://orionbrowser.com/
- Orion iOS supports *some* Firefox and Chrome WebExtensions, including file-based installation, but warns that its APIs are incomplete: https://help.kagi.com/orion/browser-extensions/ios-ipados-extensions.html
- On Mac, Orion documents approximately 70% WebExtension API support; this percentage is not a compatibility guarantee for iPhone: https://help.kagi.com/orion/browser-extensions/macos-extensions.html
- Official GitHub organization https://github.com/OrionBrowser has selected auxiliary repositories, **not the browser's full source**. Orion's browser code is not publicly available as a complete open-source project as of this review: https://orionbrowser.com/help
- Orion's Linux beta exists but Kagi stopped supporting it after October 2, 2026 and advises against using it as a daily browser: https://blog.kagi.com/update-orion-linux-windows . Do not substitute an unmaintained beta for the user's working Ubuntu Firefox.
- An official Android Orion build is not available. A future Windows build was not shipped by Kagi.

## Implementation committed
- The default Firefox build keeps its full existing MV2 network, hybrid filter, GraphQL, YouTube, popup, settings and diagnostics code. No approved UI moved.
- The **same real source files** in src/ (`company-modules.js`, `facebook-ads.js`, `ad-recognition.js`) are packaged by `scripts/package-orion-candidate.py` rather than copied or forked.
- New `src/orion-dom.js` is a thin, bounded adapter. It has no hard dependency on a browser background runtime. It activates the shared DOM scanners, watches relevant changes, and restores its own hiding on pagehide.
- It is intentionally **DOM-only** because Orion iPhone's network blocking, response-stream filtering, native messaging, browserSettings, DNS/proxy and request-history support are unverified. It does not offer those controls and cannot claim them.
- `src/orion-status.html` discloses exactly that. Two separate candidate targets (`orion-ios`, `orion-macos`) are inventoried in `platform/targets.json` under `experimental_targets`; unmaintained Orion Linux is documented but not packaged.
- The build script requires explicit `--target` plus `--candidate` to create an unsigned, unverified local test ZIP; `--verify` performs offline source validation without a package. No automatic download, GitHub Actions, install or signed release. Output is clearly marked EXPERIMENT.
- If the browser cannot run even the content scripts, this candidate cannot help. If DOM detection works, it can *hide* recognized ads but does not prevent first-party ad downloads; the difference must be explained to users.

## Next technical gates
1. **Orion iPhone:** start with a user-authorized file-based candidate installation, verify manifest and every shared script starts. Keep Orion's own blocker off only during the controlled comparison.
2. Test Facebook feed and Sponsored right rail on iPhone, including ordinary posts, Marketplace, Messenger, Contacts, login and scroll performance. Show both true ad removals and false positives.
3. Inspect which Orion APIs actually exist: MV2 blocking webRequest, filterResponseData, storage, tabs, messaging, extension popup, host permissions, background lifetime, native messaging, browserSettings. Prefer feature checks over user-agent sniffing. Avoid invasive or unsupported permission requests.
4. If proven, add an Orion network adapter with fail-open safeguards and shared filtering rules. **Do not** quietly activate the Firefox-only GraphQL response filter. Its current source setting remains off.
5. Compare Mac Orion separately; macOS success does not prove iOS success. Do not market Firefox parity, website shortcut support or final add-on store installation until accepted.
6. Later, Chrome/Edge use Chromium MV3 declarativeNetRequest, Safari needs its own packaging and APIs, and Android requires compatible extension-enabled browsers. Shared *filtering logic* does not mean the same browser APIs exist everywhere.

## Privacy and user control
No network to DK servers, telemetry, account content capture, remote JS, cookies or credentials in this Orion candidate. Hiding only affects the current page and is reversed on pagehide; disabling the experimental extension in Orion is the immediate fallback. Do not invent Orion ad-blocking results.
