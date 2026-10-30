#!/usr/bin/env python3
"""Explicit per-user Firefox native companion installer, no sudo or downloads."""
from __future__ import annotations
import json
import os
from pathlib import Path
import shutil
import sys

NAME = "dk_live_block_companion"
EXTENSION_ID = "dk-live-block@elderred-softworks.local"


def install(home: Path, source: Path) -> tuple[Path, Path]:
    data = home / ".local" / "share" / "dk-live-block"
    dependencies = data / "dependencies"
    companion = data / "companion" / "native_host.py"
    registry = home / ".mozilla" / "native-messaging-hosts" / (NAME + ".json")
    if not source.is_file():
        raise FileNotFoundError("Companion source missing: " + str(source))
    dependencies.mkdir(parents=True, exist_ok=True)
    companion.parent.mkdir(parents=True, exist_ok=True)
    registry.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(source, companion)
    companion.chmod(0o700)
    module = source.with_name("verified_install.py")
    if not module.is_file():
        raise FileNotFoundError("Pinned dependency installer module missing")
    copied = companion.with_name("verified_install.py")
    shutil.copyfile(module, copied)
    copied.chmod(0o600)
    manifest = {
        "name": NAME,
        "description": "DK Live Block optional read-only tool detection",
        "path": str(companion.resolve()),
        "type": "stdio",
        "allowed_extensions": [EXTENSION_ID],
    }
    temporary = registry.with_suffix(".json.tmp")
    temporary.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    os.chmod(temporary, 0o600)
    temporary.replace(registry)
    return dependencies, registry


if __name__ == "__main__":
    if sys.platform != "linux":
        raise SystemExit("This development companion installer supports Linux only.")
    source = Path(__file__).resolve().parent.parent / "companion" / "native_host.py"
    dep, registration = install(Path.home(), source)
    print("Optional DK companion registered for this Linux user.")
    print("Dependencies:", dep)
    print("Firefox native manifest:", registration)
    print("No third-party tools were downloaded or installed.")
