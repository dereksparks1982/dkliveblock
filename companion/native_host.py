#!/usr/bin/env python3
"""DK Live Block optional Linux companion v2. No arbitrary browser paths or commands.
A user-confirmed action installs only a pinned, verified yt-dlp release.
"""
from __future__ import annotations

import json
import os
from pathlib import Path
import shutil
import struct
import sys

PROTOCOL = 1
MAX_REQUEST = 32768
TOOLS = {
    "yt-dlp": ("yt-dlp/yt-dlp", "yt-dlp"),
    "ffmpeg": ("ffmpeg/bin/ffmpeg", "ffmpeg/ffmpeg"),
    "deno": ("deno/deno",),
    "node": ("node/bin/node", "node/node"),
}
SYSTEM_NAMES = {"yt-dlp": "yt-dlp", "ffmpeg": "ffmpeg", "deno": "deno", "node": "node"}


def dependency_path() -> Path:
    return Path.home() / ".local" / "share" / "dk-live-block" / "dependencies"


def inspect_tools(folder: Path) -> dict:
    result = {}
    for name, candidates in TOOLS.items():
        location = "missing"
        for relative in candidates:
            target = folder / relative
            # No symlink traversal for local manually supplied tool candidates.
            if target.is_symlink() or any(parent.is_symlink() for parent in target.parents if parent != folder.parent):
                continue
            if target.is_file() and os.access(target, os.X_OK):
                location = "local"
                break
        if location == "missing" and shutil.which(SYSTEM_NAMES[name]):
            location = "system"
        result[name] = {"status": location}
    return result


def handle(message: object) -> dict:
    if not isinstance(message, dict) or message.get("protocol") != PROTOCOL:
        return {"ok": False, "protocol": PROTOCOL, "error": "Invalid protocol"}
    action = message.get("action")
    if action not in ("status", "ping", "installTool", "removeTool"):
        return {"ok": False, "protocol": PROTOCOL, "error": "Unsupported action"}
    base = dependency_path()
    if action == "ping":
        return {"ok": True, "protocol": PROTOCOL}
    if action in ("installTool", "removeTool"):
        # No browser-provided URL, hash, command, filename or alternate tool.
        if message.get("toolId") != "yt-dlp" or message.get("confirmation") != "explicit-user-action":
            return {"ok": False, "protocol": PROTOCOL, "error": "Unsupported tool or missing consent"}
        try:
            import verified_install
            result = (verified_install.install_yt_dlp(base) if action == "installTool"
                      else verified_install.remove_yt_dlp(base))
            return {"protocol": PROTOCOL, **result}
        except (OSError, ValueError, RuntimeError) as error:
            return {"ok": False, "protocol": PROTOCOL, "error": str(error)[:160]}
    return {
        "ok": True,
        "protocol": PROTOCOL,
        "directory": str(base),
        "tools": inspect_tools(base),
    }


def main() -> int:
    head = sys.stdin.buffer.read(4)
    if len(head) != 4:
        return 1
    size = struct.unpack("<I", head)[0]
    if size < 2 or size > MAX_REQUEST:
        return 1
    message = sys.stdin.buffer.read(size)
    if len(message) != size:
        return 1
    try:
        payload = handle(json.loads(message.decode("utf-8")))
    except (ValueError, UnicodeError, TypeError):
        payload = {"ok": False, "protocol": PROTOCOL, "error": "Invalid request"}
    encoded = json.dumps(payload, separators=(",", ":")).encode("utf-8")
    sys.stdout.buffer.write(struct.pack("<I", len(encoded)) + encoded)
    sys.stdout.buffer.flush()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
