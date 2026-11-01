#!/usr/bin/env python3
"""Local, privacy-safe AMO candidate preflight. Does not build, publish or upload."""
from __future__ import annotations

import argparse
import json
import base64
import binascii
from pathlib import Path
from html.parser import HTMLParser

ROOT = Path(__file__).resolve().parent.parent
CHECK_FILES = (
    "LICENSE", "README.md", "COMPANY_BIBLE.md",
    "docs/PRIVACY.md", "docs/FIREFOX_MARKETPLACE.md",
    "docs/AMO_REVIEWER_NOTES.md",
    "src/LICENSE-GHOSTERY.txt", "src/LICENSE-PSL.txt",
    "vendor/public_suffix_list.dat", "scripts/build-ghostery.mjs",
)
GHOSTERY_VERSION = "2.20.3"
ESBUILD_VERSION = "0.25.12"
GITHUB_HOMEPAGE = "https://github.com/dereksparks1982/dkliveblock"

class RepositoryLinkParser(HTMLParser):
    """Find a safe, clickable official repository link without contacting GitHub."""
    def __init__(self):
        super().__init__()
        self.found = False

    def handle_starttag(self, tag, attrs):
        if tag != "a":
            return
        item = dict(attrs)
        rel = set((item.get("rel") or "").lower().split())
        if (item.get("href") == GITHUB_HOMEPAGE and item.get("target") == "_blank"
                and {"noopener", "noreferrer"}.issubset(rel)):
            self.found = True


def issues(root: Path = ROOT) -> list[str]:
    """Return release blockers without accessing the network or user information."""
    problems: list[str] = []
    for path in CHECK_FILES:
        if not (root / path).is_file():
            problems.append("Missing release/reviewer asset: " + path)

    def parse(path: str):
        try:
            return json.loads((root / path).read_text(encoding="utf-8"))
        except (ValueError, OSError):
            problems.append("Missing or invalid JSON: " + path)
            return {}

    manifest = parse("src/manifest.json")
    package = parse("package.json")
    if manifest.get("homepage_url") != GITHUB_HOMEPAGE:
        problems.append("Manifest homepage_url must point to the official GitHub repository")
    for page in ("src/popup.html", "src/options.html"):
        try:
            markup = (root / page).read_text(encoding="utf-8")
            parser = RepositoryLinkParser()
            parser.feed(markup)
            if not parser.found:
                problems.append("Missing secure official GitHub repository link: " + page)
        except (OSError, ValueError):
            problems.append("Missing or invalid extension page for GitHub link: " + page)
    if manifest.get("manifest_version") != 2:
        problems.append("Unexpected manifest generation; review MV2 compatibility")
    if not isinstance(manifest.get("version"), str) or manifest.get("version") != package.get("version"):
        problems.append("Manifest/package version mismatch")
    gecko = manifest.get("browser_specific_settings", {}).get("gecko", {})
    if not isinstance(gecko, dict) or not gecko.get("id"):
        problems.append("Firefox extension ID missing")
    if manifest.get("update_url") or (isinstance(gecko, dict) and gecko.get("update_url")):
        problems.append("Remove external update URL from AMO-listed candidate")
    if package.get("dependencies", {}).get("@ghostery/adblocker") != GHOSTERY_VERSION:
        problems.append("Ghostery package version must be pinned exactly")
    if package.get("devDependencies", {}).get("esbuild") != ESBUILD_VERSION:
        problems.append("esbuild version must be pinned exactly")

    bundle = root / "src/ghostery-vendor.js"
    if not bundle.is_file() or bundle.stat().st_size < 100_000:
        problems.append("Missing or placeholder packaged Ghostery bundle")
    if (root / "LICENSE").is_file():
        license_text = (root / "LICENSE").read_text(encoding="utf-8")
        if "NO MONETIZATION" not in license_text or "THIRD-PARTY" not in license_text:
            problems.append("Custom owner license or third-party carve-out missing")
    if (root / "README.md").is_file():
        readme = (root / "README.md").read_text(encoding="utf-8")
        if "Not for sale or commercial exploitation" not in readme:
            problems.append("README must disclose owner licensing policy")

    # Reviewers need the exact transitive dependency tree for a repeatable bundle.
    # A pinned package.json alone is not a reproducible source submission.
    lockfile = root / "package-lock.json"
    if not lockfile.is_file():
        problems.append("Missing package-lock.json: reviewer build cannot be reproduced with npm ci")
    else:
        lock = parse("package-lock.json")
        if lock.get("name") != package.get("name"):
            problems.append("Lockfile root package name mismatch")
        if lock.get("lockfileVersion") not in (2, 3):
            problems.append("Unsupported npm lockfile version")
        packages = lock.get("packages", {})
        root_pkg = packages.get("", {}) if isinstance(packages, dict) else {}
        if root_pkg.get("name", package.get("name")) != package.get("name"):
            problems.append("Lockfile root package entry name mismatch")
        if root_pkg.get("version") != package.get("version"):
            problems.append("Lockfile root version does not match package.json")
        if root_pkg.get("dependencies", {}).get("@ghostery/adblocker") != GHOSTERY_VERSION:
            problems.append("Lockfile root Ghostery dependency mismatch")
        if root_pkg.get("devDependencies", {}).get("esbuild") != ESBUILD_VERSION:
            problems.append("Lockfile root esbuild dependency mismatch")
        for dependency, expected in (("@ghostery/adblocker", GHOSTERY_VERSION), ("esbuild", ESBUILD_VERSION)):
            item = packages.get("node_modules/" + dependency) if isinstance(packages, dict) else None
            if not isinstance(item, dict) or item.get("version") != expected:
                problems.append("Lockfile missing or mismatched resolved " + dependency + " package")
        # A version alone is not an immutable, reproducible transitive dependency.
        # Do not accept local links, unofficial tarball hosts or unverifiable hashes.
        if isinstance(packages, dict):
            for path, entry in packages.items():
                if path == "":
                    continue
                if (not isinstance(path, str) or not path.startswith("node_modules/")
                        or "/../" in path or not isinstance(entry, dict)
                        or entry.get("link") is True):
                    problems.append("Unsupported linked or malformed npm lock package entry")
                    continue
                if not isinstance(entry.get("version"), str) or not entry["version"]:
                    problems.append("Lock package lacks an exact version: " + path[:100])
                resolved = entry.get("resolved")
                if not isinstance(resolved, str) or not resolved.startswith("https://registry.npmjs.org/"):
                    problems.append("Lock package not resolved from official npm registry: " + path[:100])
                integrity = entry.get("integrity")
                valid = False
                if isinstance(integrity, str) and integrity.startswith("sha512-"):
                    try:
                        digest = base64.b64decode(integrity[7:], validate=True)
                        valid = len(digest) == 64
                    except (ValueError, binascii.Error):
                        pass
                if not valid:
                    problems.append("Lock package missing valid SHA512 integrity: " + path[:100])
        else:
            problems.append("Lockfile packages index missing")

    return problems


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--report", action="store_true",
                        help="Audit missing requirements but do not block general development tests")
    parser.add_argument("--strict", action="store_true",
                        help="Fail on any issue; mandatory for explicitly approved packaging")
    args = parser.parse_args()
    if args.report == args.strict:
        parser.error("Choose exactly one of --report or --strict")
    blockers = issues()
    if blockers:
        for problem in blockers:
            print("AMO BLOCKER: " + problem)
        print(f"AMO preflight: {len(blockers)} open blocker(s); NOT ready for submission.")
        return 1 if args.strict else 0
    print("AMO static preflight passed. NOT proof of Firefox tests, owner acceptance or Mozilla approval.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
