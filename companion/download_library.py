#!/usr/bin/env python3
"""DK Build 32: read-only, local-only listing of managed downloaded media."""
from __future__ import annotations
import os
from pathlib import Path
import stat
import time
import video_download

EXTENSIONS=frozenset((".mp4",".mkv",".webm",".m4a",".mp3",".opus",".ogg",".mov"))
MAX_ITEMS=150
MAX_SCAN=3000

def list_downloads(folder=None):
    root=Path(folder) if folder is not None else video_download.download_folder()
    if root.is_symlink() or any(parent.is_symlink() for parent in root.parents if parent != Path.home().parent):
        raise ValueError("Refusing symlinked downloads folder")
    if not root.exists():
        return {"ok":True,"directory":str(root),"items":[],"truncated":False}
    if not root.is_dir():
        raise ValueError("DK Downloads location is not a directory")
    found=[]
    scanned=0
    with os.scandir(root) as listing:
        for entry in listing:
            scanned+=1
            if scanned>MAX_SCAN:
                break
            # Do not follow symlinks or inspect hidden/partial files or directories.
            name=entry.name
            if not name or name.startswith(".") or len(name)>240 or Path(name).suffix.lower() not in EXTENSIONS:
                continue
            try:
                info=entry.stat(follow_symlinks=False)
            except OSError:
                continue
            if not stat.S_ISREG(info.st_mode):
                continue
            safe="".join(char if 32<=ord(char)<127 else "_" for char in name)[:180]
            if not safe:
                continue
            found.append({"name":safe,"size":int(max(0,info.st_size)),
                          "modified":int(min(time.time(),max(0,info.st_mtime)))})
    found.sort(key=lambda item:(-item["modified"],item["name"]))
    return {"ok":True,"directory":str(root),"items":found[:MAX_ITEMS],
            "truncated":scanned>MAX_SCAN or len(found)>MAX_ITEMS}
