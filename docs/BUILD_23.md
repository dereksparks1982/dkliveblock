# Build 23: Verified optional yt-dlp dependency installation
Version 0.2.4 | Status: **UNRELEASED**

## Implemented
- Settings → Dependencies: user-confirmed Install verified yt-dlp and Remove managed copy controls, enabled only after connecting the optional Linux native companion.
- Pinned, official yt-dlp Linux x86_64 release v2026.10.26 (41,166,968 bytes, SHA-256 767ba9dce7052aa196f8b12652f433d76de128ba168966fa84b6394d5e6c6795).
- Restricted HTTPS redirect hosts, exact-byte hashing, ELF architecture guard, timeout/size limits, temporary files, atomic no-clobber copy and refusal to overwrite or remove modified/symlinked tools.
- Browser messages do not supply arbitrary URLs or commands; other tools remain official links only.
- Reinstalling the optional companion via developer script copies both the host and the new verification module.
- New offline verification suite covers valid install/removal, wrong checksum, truncated content, malicious redirects, symlinks, preservation of modified files and explicit user confirmation.
- Ordinary ad blocking remains independent of optional software.

## Not yet completed
- Full offline suite and actual Ubuntu Firefox end-to-end native messaging/download still need running.
- A normal-user graphical native companion installer and publisher signature/attestation verification.
- FFmpeg managed installs, yt-dlp download-video UI, videos library, YouTube preroll/midroll and Disney+ acceptance.
- No software was downloaded, installed or executed on the user's personal machine by this development source commit.
- No public release or ABP parity assertion.

See `docs/COMPANION.md` for the exact per-user path and developer installation instructions.
