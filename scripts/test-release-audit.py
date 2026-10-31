#!/usr/bin/env python3
"""Offline failure scenarios for the page packaging auditor."""
import importlib.util
import tempfile
from pathlib import Path

spec = importlib.util.spec_from_file_location("dklb_audit", Path(__file__).with_name("release-audit.py"))
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
with tempfile.TemporaryDirectory(prefix="dklb-page-") as directory:
    root = Path(directory)
    (root / "page.html").write_text(
        '<link rel="stylesheet" href="style.css"><div id="good"></div><script src="page.js"></script>')
    (root / "page.js").write_text('const item = $("good");')
    (root / "style.css").write_text("body{color:black}")
    assert module.audit_pages(root) == []
    (root / "page.js").write_text('const item = $("missing");')
    assert any("Missing control" in x for x in module.audit_pages(root))
    (root / "page.html").write_text(
        '<div id="good"></div><div id="good"></div>'
        '<script src="page.js"></script><script>unsafe()</script><script src="missing.js"></script>')
    failures = module.audit_pages(root)
    for marker in ("Duplicate HTML id", "Inline extension script", "Missing page asset"):
        assert any(marker in error for error in failures), marker
print("PASS: page audit catches missing controls, duplicates, inline scripts and missing files.")
