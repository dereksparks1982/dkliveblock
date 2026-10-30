# DK Live Block: Build 25 · Video download controls

**Version:** 0.2.6. **Status:** unreleased development source. No public extension package or signed companion installer.

## What changed

- Three quality modes in the Firefox toolbar: Compatible MP4 (single stream), Best quality (requires user-installed FFmpeg, merged to MKV), and Audio only (original format).
- Strict enumeration of formats on both sides of the native messaging boundary, in addition to validated YouTube video IDs, checked tab URL and explicit opt-in.
- Optional FFmpeg discovery in the dedicated Linux dependency folder or from system PATH, without automatic installation or trusting input paths supplied through the browser. System FFmpeg is **not independently hash verified**.
- Native messaging switched from one-shot `sendNativeMessage` to persistent `connectNative` for active downloads only. Bounded percentage messages update the popup while yt-dlp runs.
- Cancel Download sends a message to the native host, which signals the worker and terminates the process group, including FFmpeg child processes where applicable.
- Native job output is not sent to an external service, and the extension only retains coarse status in memory. Failed and cancelled jobs are reported clearly. Some incomplete `.part` files can remain.
- Optional companion source installers now also include `download_jobs.py`. No dependency is required for baseline ad blocking.
- Offline regression cases cover quality allowlisting, command options, missing FFmpeg, progress parsing, harmless local subprocess streaming, and cancellation.

## Still open

- Run full `bash scripts/test-local.sh` on a complete checkout and test the per-user installer and native host in real Linux Firefox.
- Test actual public YouTube video downloads with authorized media, including best-quality merging, cancellation and error recovery.
- Test YouTube preroll/midroll ad blocking and Disney+ uninterrupted playback in Firefox; ABP parity remains unverified.
- User-facing install experience is not signed or approved for public release. Source commits only, no GitHub Actions.
