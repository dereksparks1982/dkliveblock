#!/usr/bin/env python3
"""Explicit, development-only Orion DOM candidate. No downloads, no CI, no silent install.
Reuses the SAME DK JavaScript sources; does not claim Firefox network parity."""
from __future__ import annotations
import argparse
import json
import sys
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SHARED = ("company-modules.js", "meta-agent-nesty.js", "facebook-ads.js", "ad-recognition.js", "orion-pause.js", "orion-dom.js")
TARGETS = ("orion-ios", "orion-macos")

def candidate_files(target):
    firefox = json.loads((ROOT / "src/manifest.json").read_text(encoding="utf-8"))
    if firefox.get("manifest_version") != 2:
        raise ValueError("Firefox reference manifest is no longer MV2")
    sources = {name: (ROOT / "src" / name).read_bytes() for name in SHARED}
    status = (ROOT / "src/orion-status.html").read_bytes()
    popup_js = (ROOT / "src/orion-popup.js").read_bytes()
    icon = (ROOT / "src/icons/dk-live-block.png").read_bytes()
    if len(icon) < 100000:
        raise ValueError("Approved DK emblem is missing")
    manifest = {
        "manifest_version": 2,
        "name": "DK Live Block - Orion DOM Experiment",
        "version": firefox["version"],
        "description": "Experimental DOM-only ad recognition; no network request blocking",
        "permissions": ["tabs", "storage", "http://*/*", "https://*/*"],
        "content_scripts": [{
            "matches": ["http://*/*", "https://*/*"],
            "js": list(SHARED),
            "run_at": "document_idle",
            "all_frames": False
        }],
        "browser_action": {"default_title": "DK Orion experiment",
                           "default_popup": "orion-status.html",
                           "default_icon": "dk-live-block.png"},
        "icons": {"48": "dk-live-block.png", "96": "dk-live-block.png"}
    }
    if target not in TARGETS:
        raise ValueError("Unrecognized Orion candidate platform")
    if "background" in manifest or "webRequest" in manifest["permissions"]:
        raise ValueError("DOM-only candidate must not claim network access")
    files = {"manifest.json": (json.dumps(manifest, indent=2) + "\n").encode(),
             "orion-status.html": status, "orion-popup.js": popup_js, "dk-live-block.png": icon}
    files.update(sources)
    return files

def main(argv=None):
    parser = argparse.ArgumentParser(description="Inspect/build an experimental Orion DOM-only package")
    parser.add_argument("--target", choices=TARGETS, required=True)
    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument("--verify", action="store_true", help="Offline checks only; no package")
    mode.add_argument("--candidate", action="store_true", help="Explicitly produce an unverified test ZIP")
    args = parser.parse_args(argv)
    files = candidate_files(args.target)
    if args.verify:
        print(args.target + ": " + str(len(files)) + " packaged entries verified; NO output package")
        return 0
    dest = ROOT / "build" / ("dk-live-block-" + args.target + "-dom-EXPERIMENT.zip")
    dest.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(dest, "w", compression=zipfile.ZIP_DEFLATED) as archive:
        for name, data in sorted(files.items()):
            entry = zipfile.ZipInfo(name, (1980, 1, 1, 0, 0, 0))
            entry.compress_type = zipfile.ZIP_DEFLATED
            entry.external_attr = 0o644 << 16
            archive.writestr(entry, data)
    print("UNVERIFIED experimental test archive: " + str(dest))
    return 0

if __name__ == "__main__":
    sys.exit(main())
