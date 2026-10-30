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

## Build 24: video download capability and one-file installer source

Video saving and timestamp resume now work inside Firefox without the companion. Downloading uses an optional yt-dlp executable in the approved dependencies folder. The browser sends a single YouTube video ID plus an explicit approval marker; the Python companion constructs the URL itself, verifies the managed binary's pinned SHA-256 and runs yt-dlp with no shell, no playlists, no cookies and no caller-supplied URL or output path.

Files are saved under `~/.local/share/dk-live-block/downloads/`. The browser background tracks one job per session, up to 15 minutes, with coarse running/done/failed status. Exiting Firefox or missing native messaging support can interrupt a download. Quality choices, FFmpeg merging, cancellation and detailed progress are not yet implemented.

The optional source-only packaging tool `python3 scripts/make-companion-installer.py --candidate` creates `dist/dk-live-block-companion-linux.pyz`. It bundles the DK native host and modules (not yt-dlp or other third-party programs) and offers a Tkinter install window where available. A manual Python command may be necessary when no graphical Python/Tkinter or desktop file association is present. Not signed or released.

## Build 25: quality modes, optional FFmpeg, progress and cancellation

The Firefox toolbar offers three **fixed choices**, not free-form command arguments: `compatible` (single MP4 stream when available), `best` (best streams merged with FFmpeg to MKV), and `audio` (best audio track, source container without conversion). Unsupported qualities are rejected by both the extension background and Linux native companion.

The `best` mode requires FFmpeg. The companion checks `~/.local/share/dk-live-block/dependencies/ffmpeg/bin/ffmpeg`, `ffmpeg/ffmpeg`, then the system PATH. It does not install or automatically update FFmpeg; user-supplied and system binaries are not verified by DK, unlike our pinned managed yt-dlp binary.

Build 25 adds `download_jobs.py` to the optional companion and `.pyz` installer. The Firefox extension uses a **persistent** native port, enabling intermediate numeric progress and a Cancel Download action. The worker runs a single allowlisted yt-dlp command (no shell) and stops its Linux process group on cancellation or after 15 minutes. The progress display represents yt-dlp's download output and might not include subsequent FFmpeg merging time. No automatic history collection, no telemetry, and no downloads unless the user explicitly confirms.

Any user with a previously installed Build 24 development companion must reinstall the updated companion source to obtain progress and cancel support. The directory chosen earlier remains unchanged. Cancellation can leave partial downloads that the user can remove manually. No real browser/streaming acceptance yet.

## Build 32: My Downloads read-only inventory

The companion supports the `listDownloads` command, which reads only the fixed DK downloads directory and returns at most 150 ordinary media-file names, sizes and last-modified times. It ignores symlinks, partial, hidden, non-media and directory entries, and caps scanning at 3000 directory entries. No arbitrary folder path is accepted. Nothing opens, deletes or executes a file.

The extension's **My Downloads** page runs this command only after the user clicks **Scan My Downloads** and grants optional native messaging permission. The optional companion installer now includes `download_library.py`. Real browser testing and signature/packaging approval remain outstanding.
