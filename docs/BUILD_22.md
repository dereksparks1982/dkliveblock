# Build 22: Dependencies & Applications Manager

Version 0.2.3. **UNRELEASED developer source build**. No Mozilla Add-ons submission and no release artifact.

## Integrated
- Static official HTTPS directory for yt-dlp, FFmpeg, Deno, Node.js and yt-dlp-ejs, with a separate list of recommended editors/IDEs (Sublime Text, Kate, Geany, VSCodium).
- New settings page manager and direct toolbar navigation to the section.
- Optional Firefox native messaging permission, asked only on clicking Check installed tools, rather than as an extension install requirement.
- Read-only Python 3 Linux native companion, per-user registration and automatic creation of `~/.local/share/dk-live-block/dependencies/` when companion installer is run. The companion does not execute third-party programs.
- Strong separation of optional host availability from ad blocking and embedded Ghostery.
- Offline regression tests for catalog links, optional permissions, companion protocol/framing, path/symlink boundaries and installation into an isolated home.

## Not included or verified
- No direct download/install/update of yt-dlp or third-party programs, and no integration for downloading YouTube videos yet.
- No claim that detected files are trusted, up to date, functional or version-compatible.
- Normal Firefox Add-ons users will still need a future straightforward companion installer for optional native features. Source developer script is present but not a released package.
- No Firefox native messaging test on a real Ubuntu browser, no YouTube preroll/midroll or Disney+ playback acceptance, no ABP parity.
- Full offline suite must pass before an accepted snapshot or release.

See `docs/COMPANION.md` for exact directory locations, security boundaries and manual developer setup. No hosted GitHub Actions or automated releases.
