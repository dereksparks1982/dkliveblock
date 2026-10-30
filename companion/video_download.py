#!/usr/bin/env python3
"""Build 24: explicitly requested, strictly limited YouTube video download.
Never accept URLs, arguments, output paths or command lines from web pages.
"""
from __future__ import annotations
import os
from pathlib import Path
import re
import subprocess
import sys
import verified_install

VIDEO_ID = re.compile(r"^[A-Za-z0-9_-]{11}$")
MAX_SECONDS = 900
def download_folder():
    return Path.home() / ".local" / "share" / "dk-live-block" / "downloads"

def download(video_id: str, base=None, *, runner=subprocess.run):
    if not isinstance(video_id, str) or not VIDEO_ID.fullmatch(video_id):
        raise ValueError("Only a valid YouTube video ID can be downloaded")
    if sys.platform != "linux" or not verified_install.compatible_platform():
        raise ValueError("This managed download is available for Linux x86_64 only")
    base = verified_install.dependency_path() if base is None else Path(base)
    binary = base / "yt-dlp" / "yt-dlp"
    if not verified_install.already_installed(binary):
        raise ValueError("Install the pinned, verified yt-dlp dependency first")
    out = download_folder()
    if out.is_symlink():
        raise ValueError("Refusing a symlinked downloads directory")
    out.mkdir(mode=0o700,parents=True,exist_ok=True)
    if not out.is_dir():
        raise ValueError("Downloads location is not a directory")
    # No playlists, personal browser cookies, shell, arbitrary sites, or dynamic output paths.
    url = "https://www.youtube.com/watch?v=" + video_id
    argv = [str(binary), "--ignore-config", "--no-playlist", "--no-overwrites",
            "--no-call-home", "--no-cache-dir", "--restrict-filenames",
            "--max-filesize", "750M", "--socket-timeout", "20",
            "--retries", "2", "--fragment-retries", "2",
            "--format", "best[ext=mp4]/best",
            "--paths", str(out), "--output", "%(title).100s-%(id)s.%(ext)s",
            "--", url]
    try:
        result = runner(argv,stdin=subprocess.DEVNULL,stdout=subprocess.DEVNULL,
                        stderr=subprocess.DEVNULL,timeout=MAX_SECONDS,check=False)
    except subprocess.TimeoutExpired as error:
        raise ValueError("Video download exceeded the 15-minute limit") from error
    if result.returncode:
        raise ValueError("yt-dlp could not download this video. Check availability or try a different video.")
    return {"ok":True,"state":"complete","directory":str(out),"videoId":video_id}
