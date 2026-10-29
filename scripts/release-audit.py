#!/usr/bin/env python3
"""Offline Firefox extension structural audit. No networking, credentials, or hosted CI."""
from __future__ import annotations
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "src"

def verify():
    issues = []
    workflows = ROOT / ".github" / "workflows"
    if workflows.exists() and any(p.is_file() for p in workflows.rglob("*")):
        issues.append("Forbidden GitHub Actions workflow present")
    try:
        manifest = json.loads((SRC / "manifest.json").read_text(encoding="utf-8"))
    except (ValueError, OSError) as error:
        raise SystemExit("PHASE FAIL: manifest cannot be read: " + str(error))
    if manifest.get("manifest_version") != 2:
        issues.append("Firefox MV2 manifest expected for the existing implementation")
    gecko = manifest.get("browser_specific_settings", {}).get("gecko", {})
    if not isinstance(gecko.get("id"), str) or "@" not in gecko.get("id", ""):
        issues.append("Stable Firefox Gecko extension ID missing")
    if not re.fullmatch(r"\d+\.\d+\.\d+", manifest.get("version", "")):
        issues.append("Manifest version must be three numeric components")
    permissions = manifest.get("permissions", [])
    for needed in ["webRequest", "webRequestBlocking", "storage", "proxy", "dns"]:
        if needed not in permissions:
            issues.append("Missing permission " + needed)
    if manifest.get("update_url"):
        issues.append("Unexpected third-party update URL")
    paths = []
    paths.extend(manifest.get("background", {}).get("scripts", []))
    for entry in manifest.get("content_scripts", []):
        paths.extend(entry.get("js", []))
        paths.extend(entry.get("css", []))
    for key in ("default_popup",):
        value = manifest.get("browser_action", {}).get(key)
        if value:
            paths.append(value)
    value = manifest.get("options_ui", {}).get("page")
    if value:
        paths.append(value)
    for page in ["options.html", "popup.html"]:
        try:
            data = (SRC / page).read_text(encoding="utf-8")
        except OSError:
            issues.append("Missing extension page " + page)
            continue
        for value in re.findall(r'<script[^>]+src=["\']([^"\']+)', data, re.I):
            paths.append(value)
        if re.search(r'<script(?![^>]*\bsrc=)[^>]*>', data, re.I):
            issues.append("Inline extension script in " + page)
    for relative in paths:
        if not isinstance(relative, str):
            issues.append("Invalid manifest asset")
            continue
        candidate = (SRC / relative).resolve()
        if SRC.resolve() not in candidate.parents or not candidate.is_file():
            issues.append("Missing or outside-src asset " + relative)
    for asset in SRC.rglob("*"):
        if asset.is_symlink():
            issues.append("Symlink in extension package " + str(asset))
        if asset.is_file() and asset.suffix.lower() in (".js", ".html", ".css"):
            content = asset.read_text(encoding="utf-8")
            if re.search(r'\b(?:eval|new\s+Function)\s*\(', content):
                issues.append("Dynamic JavaScript evaluation in " + str(asset.relative_to(ROOT)))
    return issues, manifest

if __name__ == "__main__":
    errors, parsed = verify()
    for error in errors:
        print("PHASE FAIL:", error)
    if errors:
        raise SystemExit(1)
    print("PHASE PASS: Offline Firefox manifest and packaging audit, version", parsed["version"])
    print("NOTE: This is not Mozilla signing, a browser compatibility test or approval.")
