# DK Live Block: optional Linux companion and dependencies (Build 22)

**Status: UNRELEASED.** Basic ad blocking never depends on this companion, yt-dlp, FFmpeg, a JavaScript runtime, an editor, or any of the tools listed below.

## What is included now

Settings → **Dependencies & Applications** displays a static catalog with official HTTPS project links, descriptions and clear categories. Clicking **Check installed tools** requests Firefox's optional native messaging permission, then asks a local, read-only companion for tool-presence status. Without the companion, the catalog remains usable and shows that detection is unavailable. The companion does not install or execute third-party tools, manage browser downloads or scan the user's files outside the handful of explicitly approved tool paths.

The default Linux dependency directory is:

`~/.local/share/dk-live-block/dependencies/`

The companion's explicit per-user installer creates it if needed; users do not need to make it manually. Existing files in the directory are preserved. Native messaging host files go under `~/.local/share/dk-live-block/companion/`, and the per-user Firefox registration lives under `~/.mozilla/native-messaging-hosts/dk_live_block_companion.json`.

### Current developer setup, **not** the final user experience

Run `python3 scripts/install-companion.py` from a checked-out DK Live Block repository. This is a one-time developer setup step, not part of normal Firefox add-on installation. It requires Python 3 but no sudo, network access or downloaded dependencies. It installs a local native messaging host that **only** responds to `ping` and `status` requests. Firefox controls which extension can use the host through the registered ID `dk-live-block@elderred-softworks.local`.

After installing the extension and optional companion, open **Settings → Dependencies & Applications → Check installed tools**. Firefox may prompt for the optional native messaging permission; denying it has no effect on ad blocking.

### Folder layout for manually provided executables

```text
~/.local/share/dk-live-block/dependencies/
├── yt-dlp/yt-dlp
├── ffmpeg/bin/ffmpeg       # alternatively ffmpeg/ffmpeg
├── deno/deno
└── node/bin/node           # alternatively node/node
```

Detected executables must have execute permission. The companion checks those exact locations, and falls back to checking the OS PATH for each supported tool. It does **not** execute a binary to verify version or functionality, verify download signatures or perform installations. Status says **detected**, not verified. Files supplied by users are their responsibility; only use trusted official sources.

**yt-dlp-ejs:** This is a companion package matched to yt-dlp's version rather than a standalone binary. The manager intentionally provides instructions but does not claim it can detect or install yt-dlp-ejs yet.

**Applications:** Sublime Text, Kate, Geany and VSCodium are *recommendations*, never ad blocker dependencies. Sublime Text requires a purchased license for continued use.

### Important limitations

- Firefox cannot create the dependencies folder outside its profile or install arbitrary native executables by itself. The optional native companion's explicit installer does that. Browser-only installs show catalog links but no native status.
- A future signed, user-friendly native companion installer is still needed before ordinary Firefox Add-ons users can enable these features without developer steps.
- Ubuntu's Snap/Flatpak-constrained Firefox may require native messaging portal support or packaging-specific configuration; not yet tested.
- No executable third-party binaries or GitHub install scripts are downloaded automatically.
- This is **not** a working yt-dlp video downloader, playback capture tool or verification of YouTube/Disney+ blocking.
- The companion's registry and script are installed only when the user explicitly runs the optional installer; there is no automatic background execution except Firefox launching it on a user-initiated check.

## Offline tests

`python3 scripts/test-companion.py` checks protocol restrictions, message framing, symlink protection, detection, and installation into a temporary home. `node --test tests/dependency-catalog.test.js` checks manifest permissions, catalog safety and settings wiring. Both are included in `bash scripts/test-local.sh`.

## Next steps

Signed per-user Linux installer with transparent verification and uninstall, safe explicit installs with integrity checks, version detection and optional yt-dlp commands, video library and save-for-later UI. None are implemented in Build 22.

## Build 23: user-confirmed managed yt-dlp download (unreleased)

The development companion now implements `installTool` and `removeTool` **only for the identifier `yt-dlp`** and only when the message carries an explicit consent marker. The extension presents a browser confirmation dialog before sending either request. The allowed URL, exact file size and SHA-256 digest are hardcoded in the shipped Python source, not supplied by websites or settings.

- Pinned release: **2026.10.26**, official Linux x86_64 asset `yt-dlp_linux`.
- Expected size: **41,166,968 bytes**; expected SHA-256: `767ba9dce7052aa196f8b12652f433d76de128ba168966fa84b6394d5e6c6795`.
- Only `github.com` and `release-assets.githubusercontent.com` are permitted as HTTPS download endpoints, including redirects; final response URL is checked.
- Downloads are bounded and written to a temporary file. Exact size, hash and ELF architecture are checked before no-clobber installation at `~/.local/share/dk-live-block/dependencies/yt-dlp/yt-dlp`.
- An existing nonmatching binary is never overwritten. Removal refuses user-modified files and symlinks.
- These checks pin a reviewed release; they are **not** independent publisher signature verification. No executable is launched, and no user-provided URLs or commands can be run.
- All other dependencies remain links and detection only. The companion still requires separate installation via the developer script; no automatic installation is possible through Firefox alone.

To update an existing Build 22 developer companion to Build 23, run the same local installer again against the current source checkout. It copies both `native_host.py` and `verified_install.py`, without touching installed third-party tools.

Offline tests: `python3 scripts/test-companion.py`, `python3 scripts/test-verified-install.py`. Real GitHub download, Firefox native messaging, browser compatibility, yt-dlp functionality and streaming video remain unverified.
