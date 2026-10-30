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
import threading

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
    if action not in ("status", "ping", "installTool", "removeTool", "downloadVideo"):
        return {"ok": False, "protocol": PROTOCOL, "error": "Unsupported action"}
    base = dependency_path()
    if action == "ping":
        return {"ok": True, "protocol": PROTOCOL}
    if action == "downloadVideo":
        if message.get("confirmation") != "explicit-user-action":
            return {"ok": False, "protocol": PROTOCOL, "error": "Missing explicit user consent"}
        try:
            import video_download
            return {"protocol": PROTOCOL, **video_download.download(message.get("videoId"))}
        except (OSError, ValueError, RuntimeError) as error:
            return {"ok": False, "protocol": PROTOCOL, "error": str(error)[:160]}
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


def read_frame():
    head = sys.stdin.buffer.read(4)
    if not head:
        return None
    if len(head) != 4:
        raise ValueError("Truncated native frame")
    size = struct.unpack("<I", head)[0]
    if size < 2 or size > MAX_REQUEST:
        raise ValueError("Invalid native frame size")
    message = sys.stdin.buffer.read(size)
    if len(message) != size:
        raise ValueError("Truncated native message")
    return json.loads(message.decode("utf-8"))


def main() -> int:
    # A persistent native connection allows a Firefox toolbar Cancel request to
    # reach the process while its separate worker is downloading.
    write_lock = threading.Lock()
    current = {"worker": None, "cancel": None, "videoId": None}

    def send(payload):
        encoded = json.dumps(payload, separators=(",", ":")).encode("utf-8")
        with write_lock:
            sys.stdout.buffer.write(struct.pack("<I", len(encoded)) + encoded)
            sys.stdout.buffer.flush()

    def start_job(payload):
        from download_jobs import MODES, ID_RE, run
        video_id = payload.get("videoId")
        mode = payload.get("quality")
        if (payload.get("confirmation") != "explicit-user-action"
                or not isinstance(video_id, str) or not ID_RE.fullmatch(video_id)
                or mode not in MODES):
            send({"type": "finished", "protocol": PROTOCOL, "videoId": video_id if isinstance(video_id, str) else "",
                  "state": "failed", "error": "Invalid video, quality or consent"})
            return
        if current["worker"] is not None and current["worker"].is_alive():
            send({"type": "finished", "protocol": PROTOCOL, "videoId": video_id,
                  "state": "failed", "error": "Another native download is running"})
            return
        cancel = threading.Event()
        current["cancel"] = cancel
        current["videoId"] = video_id

        def worker():
            try:
                outcome = run(video_id, mode, lambda ev: send({"protocol": PROTOCOL, **ev}), cancel)
                send({"type": "finished", "protocol": PROTOCOL, "videoId": video_id,
                      "state": outcome["state"], "error": ""})
            except (OSError, ValueError, RuntimeError) as exc:
                send({"type": "finished", "protocol": PROTOCOL, "videoId": video_id,
                      "state": "failed", "error": str(exc)[:160]})
        thread = threading.Thread(target=worker, daemon=True, name="dk-video-download")
        current["worker"] = thread
        thread.start()
        send({"type": "started", "protocol": PROTOCOL, "videoId": video_id, "quality": mode})

    try:
        while True:
            try:
                payload = read_frame()
            except (ValueError, UnicodeError, TypeError):
                return 1
            if payload is None:
                return 0
            if not isinstance(payload, dict) or payload.get("protocol") != PROTOCOL:
                send({"ok": False, "protocol": PROTOCOL, "error": "Invalid protocol"})
                continue
            action = payload.get("action")
            if action == "startVideoDownload":
                start_job(payload)
            elif action == "cancelVideoDownload":
                active = current["worker"]
                if (active is not None and active.is_alive()
                        and payload.get("videoId") == current["videoId"]
                        and current["cancel"] is not None):
                    current["cancel"].set()
                    send({"type": "cancelling", "protocol": PROTOCOL,
                          "videoId": current["videoId"]})
                else:
                    send({"ok": False, "protocol": PROTOCOL, "error": "No active matching job"})
            else:
                # Preserve one-shot status, installation, and legacy download calls.
                send(handle(payload))
    finally:
        if current["cancel"] is not None:
            current["cancel"].set()
        active = current["worker"]
        if active is not None and active.is_alive():
            active.join(timeout=5)


if __name__ == "__main__":
    raise SystemExit(main())
