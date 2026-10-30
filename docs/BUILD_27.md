# Build 27: interrupted video download recovery

**Version 0.2.8, unreleased internal source.**

The optional yt-dlp job uses `--continue` with `--no-overwrites` and the existing deterministic yt-dlp output pattern to resume partial `.part` files where supported. This is an **opt-in retry only**; no automatic downloading, no attempts to bypass network or DRM restrictions. YouTube and yt-dlp may not allow all transfers to resume.

The Firefox background remembers the last manually initiated download's coarse status locally. On restart, a previously running/cancelling job becomes `interrupted` rather than misleadingly showing active. The toolbar offers Retry Download on failed/cancelled/interrupted jobs, with the existing confirmation and native permission gate. A native phase classifier emits only `merging` or `processing`, not raw filenames or console output.

**Unfinished:** complete repository tests, live Firefox/Ubuntu native messaging, actual interrupted/restarted download tests, live YouTube ad blocking and Disney+ playback, ABP parity and public release authorization.
