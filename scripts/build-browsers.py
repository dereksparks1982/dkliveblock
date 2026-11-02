#!/usr/bin/env python3
"""One-source browser target selector. Never ship an incomplete port.
No GitHub Actions, automatic installers, network access or hidden packages.
The only candidate route delegates to DK's EXISTING strict Firefox builder."""
from __future__ import annotations
import argparse
import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CONFIG = ROOT / "platform" / "targets.json"


def load_plan():
    data = json.loads(CONFIG.read_text(encoding="utf-8"))
    if data.get("single_source") != "src" or set(data.get("targets", {})) != {
        "firefox", "chrome", "edge"
    }:
        raise ValueError("Browser packaging targets are incomplete")
    supported = data["targets"]["firefox"]
    if supported["status"] != "development" or supported["manifest"] != 2:
        raise ValueError("Firefox reference target changed unexpectedly")
    for name in ("chrome", "edge"):
        entry = data["targets"][name]
        if (entry.get("status") != "adapter-required"
                or entry.get("manifest") != 3
                or entry.get("network_backend") != "declarative-net-request"):
            raise ValueError(name + " port must remain fail-closed until ready")
    return data


def main():
    parser = argparse.ArgumentParser(description="DK Live Block browser packaging selector")
    parser.add_argument("--plan", action="store_true",
                        help="Read-only three-browser build matrix; produces NO package")
    parser.add_argument("--browser", choices=("firefox", "chrome", "edge"))
    parser.add_argument("--candidate", action="store_true",
                        help="Require explicit owner-initiated candidate validation")
    args = parser.parse_args()
    info = load_plan()
    if args.plan:
        if args.candidate or args.browser:
            parser.error("--plan cannot be combined with other options")
        print(json.dumps(info, indent=2))
        return 0
    if not args.browser or not args.candidate:
        parser.error("No package is created without --browser and --candidate")
    if args.browser != "firefox":
        parser.exit(2, args.browser + " package blocked: Chromium MV3/DNR network "
                    "adapter, permissions, background lifecycle, browser tests and "
                    "owner acceptance are not implemented yet. The shared source "
                    "will remain authoritative.\n")
    # Preserve the original strict AMO source, license, vendor & full local
    # regression gates. No new bypass of the existing release contract.
    return subprocess.call([sys.executable, str(ROOT / "scripts" / "package-firefox.py"),
                            "--candidate"], cwd=ROOT)


if __name__ == "__main__":
    raise SystemExit(main())
