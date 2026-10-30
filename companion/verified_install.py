#!/usr/bin/env python3
"""Pinned, user-triggered yt-dlp installation for DK Live Block on Linux.

The browser cannot supply URLs, filenames, shell commands or hashes.
Downloaded bytes are never executed; they are installed only after
exact SHA-256 and size verification against a reviewed release.
"""
from __future__ import annotations
import hashlib
import os
from pathlib import Path
import platform
import stat
import tempfile
import time
from urllib.parse import urlsplit
from urllib.request import HTTPRedirectHandler, Request, build_opener

# Official GitHub yt-dlp release metadata checked 2026-10-30.
RELEASE = {
    "version": "2026.10.26",
    "url": "https://github.com/yt-dlp/yt-dlp/releases/download/2026.10.26/yt-dlp_linux",
    "sha256": "767ba9dce7052aa196f8b12652f433d76de128ba168966fa84b6394d5e6c6795",
    "size": 41166968,
}
ALLOWED_HOSTS = frozenset(("github.com", "release-assets.githubusercontent.com"))
MAX_DURATION = 180

def trusted_url(url: str) -> bool:
    try:
        parts = urlsplit(url)
        return (parts.scheme == "https" and parts.hostname in ALLOWED_HOSTS
                and not parts.username and not parts.password and parts.port in (None, 443))
    except (ValueError, TypeError):
        return False

class RestrictedRedirects(HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        if not trusted_url(newurl):
            raise ValueError("Untrusted release download redirect")
        return super().redirect_request(req, fp, code, msg, headers, newurl)

def open_release(url: str):
    if not trusted_url(url):
        raise ValueError("Untrusted release URL")
    req = Request(url, headers={"User-Agent": "DK-Live-Block-Companion/1",
                                "Accept": "application/octet-stream"})
    return build_opener(RestrictedRedirects()).open(req, timeout=30)

def compatible_platform() -> bool:
    return platform.system() == "Linux" and platform.machine().lower() in ("x86_64", "amd64")

def safe_destination(base: Path) -> Path:
    base = Path(base)
    if base.is_symlink():
        raise ValueError("Dependency directory must not be a symlink")
    base.mkdir(parents=True, exist_ok=True)
    folder = base / "yt-dlp"
    if folder.is_symlink():
        raise ValueError("Managed yt-dlp directory must not be a symlink")
    folder.mkdir(mode=0o700, exist_ok=True)
    if not folder.is_dir():
        raise ValueError("Managed yt-dlp directory is not a folder")
    return folder / "yt-dlp"

def digest_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()

def already_installed(target: Path, recipe=None) -> bool:
    recipe = RELEASE if recipe is None else recipe
    if target.is_symlink():
        raise ValueError("Managed executable must not be a symlink")
    return (target.is_file() and target.stat().st_size == recipe["size"]
            and digest_file(target) == recipe["sha256"])

def install_yt_dlp(base: Path, *, fetch=open_release, recipe=None) -> dict:
    recipe = RELEASE if recipe is None else recipe
    if not compatible_platform():
        raise ValueError("Pinned yt-dlp binary supports Linux x86_64 only")
    if not trusted_url(recipe["url"]):
        raise ValueError("Invalid pinned release location")
    target = safe_destination(base)
    if target.exists() or target.is_symlink():
        if already_installed(target, recipe):
            return {"ok": True, "state": "already-installed", "version": recipe["version"]}
        raise ValueError("Existing yt-dlp file differs; it will not be overwritten")
    start = time.monotonic()
    temp_path = None
    try:
        hasher = hashlib.sha256()
        count = 0
        with tempfile.NamedTemporaryFile(prefix=".yt-dlp-", dir=target.parent, delete=False) as output:
            temp_path = Path(output.name)
            with fetch(recipe["url"]) as response:
                if not trusted_url(response.geturl()):
                    raise ValueError("Untrusted final download address")
                while True:
                    if time.monotonic() - start > MAX_DURATION:
                        raise ValueError("Download exceeded time limit")
                    chunk = response.read(256 * 1024)
                    if not chunk:
                        break
                    count += len(chunk)
                    if count > recipe["size"]:
                        raise ValueError("Download exceeds expected release size")
                    output.write(chunk)
                    hasher.update(chunk)
        if count != recipe["size"] or hasher.hexdigest() != recipe["sha256"]:
            raise ValueError("Downloaded yt-dlp failed pinned SHA-256 or size verification")
        with temp_path.open("rb") as verified:
            header = verified.read(20)
        if len(header) < 20 or header[:4] != b"\x7fELF" or header[18:20] != b"\x3e\x00":
            raise ValueError("Release is not an x86_64 ELF executable")
        os.chmod(temp_path, stat.S_IRUSR | stat.S_IWUSR | stat.S_IXUSR)
        os.link(temp_path, target)  # No-clobber within the same filesystem.
        return {"ok": True, "state": "installed", "version": recipe["version"]}
    finally:
        if temp_path is not None:
            temp_path.unlink(missing_ok=True)

def remove_yt_dlp(base: Path, *, recipe=None) -> dict:
    recipe = RELEASE if recipe is None else recipe
    base = Path(base)
    folder = base / "yt-dlp"
    if base.is_symlink() or folder.is_symlink():
        raise ValueError("Refusing symlinked dependency directory")
    target = folder / "yt-dlp"
    if not target.exists() and not target.is_symlink():
        return {"ok": True, "state": "not-installed"}
    if not already_installed(target, recipe):
        raise ValueError("Refusing to remove a user-modified or unverified tool")
    target.unlink()
    return {"ok": True, "state": "removed"}
