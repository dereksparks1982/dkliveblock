#!/usr/bin/env python3
"""Explicit, offline-reviewable PSL refresh from its canonical official source.

Usage: python3 scripts/update-psl.py --refresh
Updates vendored PSL and generated JavaScript, then run local test gates manually.
Never publishes or pushes anything, never prompts for credentials.
"""
from __future__ import annotations
import argparse
import json
from pathlib import Path
from urllib.request import urlopen

ROOT = Path(__file__).resolve().parent.parent
UPSTREAM = "https://publicsuffix.org/list/public_suffix_list.dat"
VENDOR = ROOT / "vendor" / "public_suffix_list.dat"
OUTPUT = ROOT / "src" / "public-suffix.js"

def generate(raw: str, template: str) -> str:
    if not raw.startswith("// This Source Code Form is subject to the terms of the Mozilla Public"):
        raise ValueError("Unexpected Public Suffix List license/header")
    lines = [line.strip() for line in raw.splitlines()]
    rules = [line for line in lines if line and not line.startswith("//")]
    if len(rules) < 9500 or "*.ck" not in rules or "!www.ck" not in rules:
        raise ValueError("Missing required public-suffix wildcard and exception rules")
    marker_start, marker_end = "const RAW=", ";\nconst normals="
    start = template.find(marker_start)
    end = template.find(marker_end, start)
    if start < 0 or end < 0:
        raise ValueError("Unknown public-suffix source template")
    encoded = json.dumps("\n".join(rules), ensure_ascii=False, separators=(",", ":"))
    return template[:start + len(marker_start)] + encoded + template[end:]

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--refresh", action="store_true", help="Explicitly fetch the canonical PSL")
    args = parser.parse_args()
    if not args.refresh:
        parser.error("No network updates without explicit --refresh")
    with urlopen(UPSTREAM, timeout=25) as stream:
        raw_bytes = stream.read(1_000_001)
    if len(raw_bytes) > 1_000_000:
        raise SystemExit("PSL download exceeded the allowed size")
    raw = raw_bytes.decode("utf-8")
    compiled = generate(raw, OUTPUT.read_text(encoding="utf-8"))
    VENDOR.write_text(raw, encoding="utf-8")
    OUTPUT.write_text(compiled, encoding="utf-8")
    print("PHASE PASS: PSL refreshed from canonical source, entries:",
          len([line for line in raw.splitlines() if line.strip() and not line.startswith("//")]))
    print("Next: bash scripts/test-local.sh; inspect changes before committing.")
if __name__ == "__main__":
    main()
