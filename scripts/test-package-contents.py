#!/usr/bin/env python3
"""Offline deterministic package-member tests. Creates no user release ZIP."""
from __future__ import annotations

import importlib.util
import tempfile
from pathlib import Path

script = Path(__file__).with_name("package-firefox.py")
spec = importlib.util.spec_from_file_location("dk_package", script)
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)

with tempfile.TemporaryDirectory(prefix="dk-package-test-") as folder:
    root = Path(folder)
    src = root / "src"
    src.mkdir()
    (root / "LICENSE").write_text("Free to use, not to monetize", encoding="utf-8")
    (src / "manifest.json").write_text('{"manifest_version": 2}', encoding="utf-8")
    (src / "background.js").write_text("// fixture", encoding="utf-8")
    (src / "LICENSE-GHOSTERY.txt").write_text("MPL-2.0", encoding="utf-8")
    (src / "LICENSE-PSL.txt").write_text("MPL-2.0", encoding="utf-8")

    members = module.package_members(root, src)
    names = [name for _, name in members]
    assert names == sorted(names), names
    assert names.count("LICENSE") == 1, names
    assert "manifest.json" in names
    assert "LICENSE-GHOSTERY.txt" in names
    assert "LICENSE-PSL.txt" in names
    assert next(p for p, name in members if name == "LICENSE") == root / "LICENSE"
    (src / "old.log").write_text("sensitive temporary log", encoding="utf-8")
    try:
        module.package_members(root, src)
        raise AssertionError("Development log must be rejected")
    except ValueError as exc:
        assert "development/hidden artifact" in str(exc)
    (src / "old.log").unlink()
    (src / "link.js").symlink_to(src / "background.js")
    try:
        module.package_members(root, src)
        raise AssertionError("Symlink must be rejected")
    except ValueError as exc:
        assert "symlink" in str(exc)
    (src / "link.js").unlink()
    (src / "LICENSE").write_text("old contradictory license", encoding="utf-8")
    try:
        module.package_members(root, src)
        raise AssertionError("Conflicting license must be rejected")
    except ValueError as exc:
        assert "shadow" in str(exc)
    (src / "LICENSE").unlink()
    (root / "LICENSE").unlink()
    try:
        module.package_members(root, src)
        raise AssertionError("Missing license must be rejected")
    except ValueError as exc:
        assert "owner LICENSE" in str(exc)

print("PASS: package asset order, owner and upstream notices, artifact/symlink and duplicate license gates.")
