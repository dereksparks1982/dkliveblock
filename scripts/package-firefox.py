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

def package_members(root: Path, src: Path):
    """Deterministic archive member plan; inject original-code license at ZIP root."""
    owner_license = root / "LICENSE"
    if not owner_license.is_file() or owner_license.is_symlink():
        raise ValueError("Packaging rejected: root owner LICENSE missing or symlink")
    if not (src / "manifest.json").is_file():
        raise ValueError("Packaging rejected: extension manifest missing")
    assets = sorted(p for p in src.rglob("*") if p.is_file())
    if not assets or any(p.is_symlink() for p in src.rglob("*")):
        raise ValueError("Packaging rejected: missing extension files or symlink")
    members = []
    for path in assets:
        name = path.relative_to(src).as_posix()
        if name == "LICENSE":
            raise ValueError("Packaging rejected: extension LICENSE would shadow owner LICENSE")
        parts = path.relative_to(src).parts
        if any(part.startswith(".") for part in parts) or path.suffix.lower() in {
                ".bak", ".tmp", ".swp", ".pyc", ".pyo", ".log"}:
            raise ValueError("Packaging rejected: development/hidden artifact " + name)
        members.append((path, name))
    members.append((owner_license, "LICENSE"))
    return sorted(members, key=lambda item: item[1])

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--candidate", action="store_true", help="Explicitly authorize creating an unsigned test candidate")
    args = parser.parse_args()
    if not args.candidate:
        parser.error("Packaging is intentionally disabled until --candidate is provided")
    print("PHASE START: AMO strict source/license preflight", flush=True)
    subprocess.run([sys.executable, "scripts/amo-preflight.py", "--strict"], cwd=ROOT, check=True)
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
    members = package_members(ROOT, SRC)
    with zipfile.ZipFile(target, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
        for file, name in members:
            info = zipfile.ZipInfo(name, (1980, 1, 1, 0, 0, 0))
            info.compress_type = zipfile.ZIP_DEFLATED
            info.external_attr = 0o644 << 16
            archive.writestr(info, file.read_bytes(), compress_type=zipfile.ZIP_DEFLATED, compresslevel=9)
    with zipfile.ZipFile(target, "r") as archive:
        names = archive.namelist()
        if len(set(names)) != len(names) or "manifest.json" not in names or "LICENSE" not in names:
            target.unlink(missing_ok=True)
            raise SystemExit("Packaging rejected: manifest/license missing or duplicate ZIP member")

    print("PHASE PASS: Unsigned package created locally:", target)
    print("NOT RELEASED. AMO review, signing and release approval still required.")
if __name__ == "__main__":
    try:
        main()
    except subprocess.CalledProcessError as e:
        raise SystemExit("Local validation failed: " + str(e))
