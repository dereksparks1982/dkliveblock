# Build 24: Save for Later and optional direct video download

**Version 0.2.5 · UNRELEASED internal source.** No browser package has been released.

## Delivered
- Manual Save for Later action in Firefox popup for YouTube watch, live, shorts and short-video URLs. Read current HTML5 player timestamp on demand only; no background browsing-history collection.
- Persistent local library with a 300-entry cap, title sanitization, validated canonical URLs, resuming at saved position and per-entry removal. No accounts or sync.
- User-confirmed Download This Video control and persistent Firefox background job state. Basic ad blocking never requires the optional companion.
- Linux native video-download module that refuses arbitrary URLs, rejects malformed video IDs, constructs a canonical YouTube watch URL, requires the exact pinned managed yt-dlp binary, uses argument-array execution without a shell and writes only under the DK downloads folder.
- Offline tests for saved entries, safe download command construction and rejecting unverified binaries.
- Internal zipapp builder with optional graphical per-user companion installer, Python standard library only (Tkinter needed for GUI), no sudo, no third-party binaries bundled.

## Not delivered
- Real end-to-end Firefox test, YouTube downloads, video quality choices, format merging, detailed progress, cancellation or real YouTube preroll/midroll and Disney+ playback acceptance.
- Signed one-click installer package or public Mozilla add-on release.
- DRM bypass or downloads of content that users are not authorized to save.

## Verification gates
Run `bash scripts/test-local.sh`, test source zipapp and native messaging on supported Linux Firefox, and repeat actual video playback checks before release.
