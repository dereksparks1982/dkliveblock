#!/usr/bin/env python3
"""Build an unsigned Firefox Add-ons submission ZIP only when explicitly requested.
No GitHub Actions, hosted builds, network access, credentials, or auto-publishing."""
from __future__ import annotations
import argparse
import json
import subprocess
import sys
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "src"
def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--candidate", action="store_true", help="Explicitly authorize creating an unsigned test candidate")
    args = parser.parse_args()
    if not args.candidate:
        parser.error("Packaging is intentionally disabled until --candidate is provided")
    print("PHASE START: Local regression gates", flush=True)
    subprocess.run(["bash", "scripts/test-local.sh"], cwd=ROOT, check=True)
    manifest = json.loads((SRC / "manifest.json").read_text(encoding="utf-8"))
    version = manifest["version"]
    target = ROOT / "dist" / ("dk-live-block-" + version + "-unsigned.zip")
    target.parent.mkdir(exist_ok=True)
    # Verify a ready-to-run embedded engine before creating a candidate.
    # This does not run during ordinary development or Git commits.
    ghostery = SRC / "ghostery-vendor.js"
    ghostery_license = SRC / "LICENSE-GHOSTERY.txt"
    if (not ghostery.is_file() or ghostery.stat().st_size < 100_000
            or not ghostery_license.is_file()
            or b"root.DKGhosteryVendor=null" in ghostery.read_bytes()):
        raise SystemExit("Packaging rejected: embedded Ghostery engine or license missing")
    files = sorted(p for p in SRC.rglob("*") if p.is_file())
    if not files or any(p.is_symlink() for p in SRC.rglob("*")):
        raise SystemExit("Packaging rejected: missing files or symlink")
    with zipfile.ZipFile(target, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
        for file in files:
            name = file.relative_to(SRC).as_posix()
            info = zipfile.ZipInfo(name, (1980, 1, 1, 0, 0, 0))
            info.compress_type = zipfile.ZIP_DEFLATED
            info.external_attr = 0o644 << 16
            archive.writestr(info, file.read_bytes(), compress_type=zipfile.ZIP_DEFLATED, compresslevel=9)
    print("PHASE PASS: Unsigned package created locally:", target)
    print("NOT RELEASED. AMO review, signing and release approval still required.")
if __name__ == "__main__":
    try:
        main()
    except subprocess.CalledProcessError as e:
        raise SystemExit("Local validation failed: " + str(e))
