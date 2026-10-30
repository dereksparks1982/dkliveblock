#!/usr/bin/env python3
"""Build 25: opt-in yt-dlp video jobs with bounded progress and cancellation.

Only validated YouTube video IDs and a fixed quality enumeration are accepted.
No browser-provided URLs, filenames, commands, cookies, or download locations.
"""
from __future__ import annotations
import os
from pathlib import Path
import re
import select
import shutil
import signal
import subprocess
import sys
import time
import verified_install
import video_download

ID_RE = re.compile(r"^[A-Za-z0-9_-]{11}$")
PROGRESS_RE = re.compile(r"^(?:\[download\]\s*)?DK_PROGRESS:\s*(\d{1,3}(?:\.\d{1,2})?)%$")
MODES = frozenset(("compatible", "best", "audio"))
MAX_SECONDS = 900


def find_ffmpeg(base: Path):
    """Local DK paths first; system-installed FFmpeg second. Never run it here."""
    base = Path(base)
    if base.is_symlink():
        return None
    for relative in ("ffmpeg/bin/ffmpeg", "ffmpeg/ffmpeg"):
        item = base / relative
        if (item.is_file() and os.access(item, os.X_OK)
                and not item.is_symlink()
                and not any(p.is_symlink() for p in item.parents if p != base.parent)):
            return str(item.absolute())
    system = shutil.which("ffmpeg")
    return str(Path(system).absolute()) if system and Path(system).is_file() else None


def make_command(video_id: str, mode: str, base=None):
    if not isinstance(video_id, str) or not ID_RE.fullmatch(video_id):
        raise ValueError("Invalid YouTube video ID")
    if mode not in MODES:
        raise ValueError("Unsupported download quality")
    if sys.platform != "linux" or not verified_install.compatible_platform():
        raise ValueError("Managed downloads currently support Linux x86_64 only")
    base = verified_install.dependency_path() if base is None else Path(base)
    binary = base / "yt-dlp" / "yt-dlp"
    if not verified_install.already_installed(binary):
        raise ValueError("Install the pinned, verified yt-dlp binary first")
    output = video_download.download_folder()
    if output.is_symlink() or any(p.is_symlink() for p in output.parents if p != Path.home().parent):
        raise ValueError("Symlinked download directory is not allowed")
    output.mkdir(parents=True, mode=0o700, exist_ok=True)
    if not output.is_dir():
        raise ValueError("Download directory unavailable")

    ffmpeg = find_ffmpeg(base)
    if mode == "best" and not ffmpeg:
        raise ValueError("Best-quality merging requires FFmpeg. Install it or choose compatible MP4.")
    formats = {
        "compatible": "best[ext=mp4]/best",
        "best": "bv*+ba/b",
        "audio": "bestaudio[ext=m4a]/bestaudio",
    }
    args = [str(binary), "--ignore-config", "--no-playlist",
            "--no-overwrites", "--no-continue", "--no-call-home", "--no-cache-dir",
            "--restrict-filenames", "--newline", "--max-filesize", "750M",
            "--socket-timeout", "20", "--retries", "2", "--fragment-retries", "2",
            "--progress-template", "download:DK_PROGRESS:%(progress._percent_str)s",
            "--format", formats[mode]]
    if mode == "best":
        args += ["--ffmpeg-location", str(Path(ffmpeg).parent), "--merge-output-format", "mkv"]
    args += ["--paths", str(output), "--output", "%(title).100s-%(id)s.%(ext)s",
             "--", "https://www.youtube.com/watch?v=" + video_id]
    return args, output


def parse_progress(line):
    if not isinstance(line, str):
        return None
    match = PROGRESS_RE.fullmatch(line.strip())
    if match is None:
        return None
    value = float(match.group(1))
    return min(100, max(0, round(value, 1))) if value <= 100 else None


def stop_process(process):
    """Terminate yt-dlp and its FFmpeg child process group on Linux."""
    if process.poll() is not None:
        return
    try:
        os.killpg(process.pid, signal.SIGTERM)
    except ProcessLookupError:
        return
    try:
        process.wait(timeout=3)
    except subprocess.TimeoutExpired:
        try:
            os.killpg(process.pid, signal.SIGKILL)
        except ProcessLookupError:
            pass
        process.wait(timeout=3)


def run(video_id, mode, emit, cancel, *, popen=subprocess.Popen, clock=time.monotonic):
    """Run exactly one verified command; emit bounded numeric progress events.

    All events are in-memory native messages, never stored or uploaded.
    """
    argv, folder = make_command(video_id, mode)
    process = popen(argv, stdin=subprocess.DEVNULL, stdout=subprocess.PIPE,
                    stderr=subprocess.DEVNULL, start_new_session=True, bufsize=0)
    last_progress = -1
    started = clock()
    fd = process.stdout.fileno()
    pending = b""
    try:
        while True:
            if cancel.is_set():
                stop_process(process)
                return {"ok": False, "state": "cancelled", "videoId": video_id}
            if clock() - started > MAX_SECONDS:
                stop_process(process)
                raise ValueError("Download exceeded 15-minute limit")
            ready, _, _ = select.select([fd], [], [], 0.25)
            if ready:
                chunk = os.read(fd, 4096)
                if chunk:
                    pending = (pending + chunk)[-8192:]
                    while b"\n" in pending:
                        line, pending = pending.split(b"\n", 1)
                        percent = parse_progress(line.decode("utf-8", errors="replace"))
                        if percent is not None and percent > last_progress:
                            last_progress = percent
                            emit({"type": "progress", "videoId": video_id, "percent": percent})
                elif process.poll() is not None:
                    break
            elif process.poll() is not None:
                break
        if cancel.is_set():
            stop_process(process)
            return {"ok": False, "state": "cancelled", "videoId": video_id}
        if process.wait(timeout=2):
            raise ValueError("yt-dlp failed. Try a different quality or check video availability.")
        return {"ok": True, "state": "complete", "videoId": video_id,
                "directory": str(folder)}
    finally:
        try:
            process.stdout.close()
        except (OSError, AttributeError):
            pass
        if process.poll() is None:
            stop_process(process)
