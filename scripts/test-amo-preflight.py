#!/usr/bin/env python3
"""Isolated failure-injection checks for the AMO candidate preflight."""
from __future__ import annotations

import importlib.util
import json
import tempfile
from pathlib import Path

script = Path(__file__).with_name("amo-preflight.py")
spec = importlib.util.spec_from_file_location("amo_preflight", script)
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


def write_json(path: Path, content: dict):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(content), encoding="utf-8")


with tempfile.TemporaryDirectory(prefix="dk-amo-preflight-") as folder:
    root = Path(folder)
    for name in module.CHECK_FILES:
        path = root / name
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text("source notice", encoding="utf-8")
    (root / "LICENSE").write_text("NO MONETIZATION\nTHIRD-PARTY", encoding="utf-8")
    (root / "README.md").write_text("Free to use, not to monetize", encoding="utf-8")
    (root / "src/ghostery-vendor.js").write_bytes(b"x" * 100_100)
    write_json(root / "package.json", {
        "version": "0.3.189",
        "dependencies": {"@ghostery/adblocker": "2.20.3"},
        "devDependencies": {"esbuild": "0.25.12"},
    })
    write_json(root / "src/manifest.json", {
        "manifest_version": 2,
        "version": "0.3.189",
        "browser_specific_settings": {"gecko": {"id": "test@dk.invalid"}},
    })
    lock = {
        "lockfileVersion": 3,
        "packages": {
            "": {"version": "0.3.189",
                 "dependencies": {"@ghostery/adblocker": "2.20.3"},
                 "devDependencies": {"esbuild": "0.25.12"}},
            "node_modules/@ghostery/adblocker": {"version": "2.20.3"},
            "node_modules/esbuild": {"version": "0.25.12"},
        },
    }
    write_json(root / "package-lock.json", lock)
    assert module.issues(root) == [], module.issues(root)

    (root / "package-lock.json").unlink()
    assert any("Missing package-lock.json" in x for x in module.issues(root))
    write_json(root / "package-lock.json", lock)

    lock["packages"][""]["dependencies"]["@ghostery/adblocker"] = "^2.20.3"
    write_json(root / "package-lock.json", lock)
    assert any("Lockfile root Ghostery" in x for x in module.issues(root))
    lock["packages"][""]["dependencies"]["@ghostery/adblocker"] = "2.20.3"
    write_json(root / "package-lock.json", lock)

    (root / "src/manifest.json").write_text("{invalid", encoding="utf-8")
    assert any("invalid JSON: src/manifest.json" in x for x in module.issues(root))
    write_json(root / "src/manifest.json", {
        "manifest_version": 2,
        "version": "0.3.189",
        "browser_specific_settings": {"gecko": {"id": "test@dk.invalid"}},
    })

    (root / "src/LICENSE-GHOSTERY.txt").unlink()
    assert any("src/LICENSE-GHOSTERY.txt" in x for x in module.issues(root))
    (root / "src/LICENSE-GHOSTERY.txt").write_text("license", encoding="utf-8")
    (root / "LICENSE").write_text("MIT License", encoding="utf-8")
    assert any("Custom owner license" in x for x in module.issues(root))
    (root / "LICENSE").write_text("NO MONETIZATION\nTHIRD-PARTY", encoding="utf-8")
    assert module.issues(root) == [], module.issues(root)

print("PASS: AMO preflight validates release inputs, lock reproducibility, license and malformed versions.")
