#!/usr/bin/env python3
"""Build 23: deterministic, completely offline pinned installer regressions."""
from __future__ import annotations
import hashlib
import io
from pathlib import Path
import sys
import tempfile
import unittest
from unittest.mock import patch

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "companion"))
import verified_install as V
import native_host as HOST

ELF = b"\x7fELF" + b"\x02\x01\x01" + b"\0" * 11 + b"\x3e\x00" + b"deterministic-offline-test"
RECIPE = {
    "version": "test-pin",
    "url": "https://github.com/yt-dlp/yt-dlp/releases/download/test/yt-dlp_linux",
    "sha256": hashlib.sha256(ELF).hexdigest(),
    "size": len(ELF),
}
class Response(io.BytesIO):
    def __init__(self, content=ELF, url=RECIPE["url"]):
        super().__init__(content)
        self.url = url
    def geturl(self):
        return self.url

class InstallerTests(unittest.TestCase):
    def test_official_release_pin_and_url_restrictions(self):
        self.assertEqual(V.RELEASE["version"], "2026.10.26")
        self.assertEqual(len(V.RELEASE["sha256"]), 64)
        self.assertTrue(V.trusted_url(V.RELEASE["url"]))
        for u in ("http://github.com/yt-dlp/yt-dlp", "https://evil.example/file",
                  "https://github.com.evil.example/file", "file:///etc/passwd",
                  "https://user:pass@github.com/file"):
            self.assertFalse(V.trusted_url(u), u)
        with self.assertRaises(ValueError):
            V.RestrictedRedirects().redirect_request(None, None, 302, "Moved", {}, "http://evil.example/binary")

    @patch.object(V, "compatible_platform", return_value=True)
    def test_explicit_install_and_remove_with_no_overwrite(self, ignored):
        with tempfile.TemporaryDirectory() as tmp:
            base = Path(tmp) / "dependencies"
            result = V.install_yt_dlp(base, recipe=RECIPE, fetch=lambda url: Response())
            self.assertEqual(result["state"], "installed")
            tool = base / "yt-dlp" / "yt-dlp"
            self.assertEqual(tool.read_bytes(), ELF)
            self.assertEqual(tool.stat().st_mode & 0o777, 0o700)
            self.assertEqual(V.install_yt_dlp(base, recipe=RECIPE,
                fetch=lambda url: self.fail("Should not redownload identical tool"))["state"], "already-installed")
            self.assertEqual(V.remove_yt_dlp(base, recipe=RECIPE)["state"], "removed")
            self.assertEqual(V.remove_yt_dlp(base, recipe=RECIPE)["state"], "not-installed")

    @patch.object(V, "compatible_platform", return_value=True)
    def test_hash_failure_and_truncated_payload_are_deleted(self, ignored):
        with tempfile.TemporaryDirectory() as tmp:
            base = Path(tmp) / "dependencies"
            for data in (ELF + b"x", ELF[:-1], b"X" * len(ELF)):
                with self.assertRaises(ValueError):
                    V.install_yt_dlp(base, recipe=RECIPE, fetch=lambda url: Response(data))
                self.assertEqual(list((base / "yt-dlp").iterdir()), [])

    @patch.object(V, "compatible_platform", return_value=True)
    def test_rejects_wrong_platform_and_final_redirect(self, ignored):
        with tempfile.TemporaryDirectory() as tmp:
            base = Path(tmp)
            with self.assertRaises(ValueError):
                V.install_yt_dlp(base, recipe=RECIPE,
                                 fetch=lambda url: Response(ELF, "https://evil.example/bin"))
            invalid = {**RECIPE, "sha256": hashlib.sha256(b"bad").hexdigest()}
            with self.assertRaises(ValueError):
                V.install_yt_dlp(base, recipe=invalid, fetch=lambda url: Response())

    @patch.object(V, "compatible_platform", return_value=True)
    def test_refuses_symlinks_and_user_modified_executables(self, ignored):
        with tempfile.TemporaryDirectory() as tmp:
            base = Path(tmp) / "dependencies"
            base.mkdir()
            (base / "yt-dlp").symlink_to(Path(tmp), target_is_directory=True)
            with self.assertRaises(ValueError):
                V.install_yt_dlp(base, recipe=RECIPE, fetch=lambda url: Response())
            (base / "yt-dlp").unlink()
            tool_dir = base / "yt-dlp"
            tool_dir.mkdir()
            target = tool_dir / "yt-dlp"
            target.write_text("precious user tool")
            with self.assertRaises(ValueError):
                V.install_yt_dlp(base, recipe=RECIPE, fetch=lambda url: Response())
            with self.assertRaises(ValueError):
                V.remove_yt_dlp(base, recipe=RECIPE)
            self.assertEqual(target.read_text(), "precious user tool")

    def test_companion_requires_confirmation_and_rejects_browser_supplied_urls(self):
        for payload in (
            {"action":"installTool", "toolId":"evil", "confirmation":"explicit-user-action"},
            {"action":"installTool", "toolId":"yt-dlp"},
            {"action":"removeTool", "toolId":"yt-dlp", "confirmation":"automatic"},
        ):
            self.assertFalse(HOST.handle({**payload,"protocol":1})["ok"])
        with patch.object(V, "install_yt_dlp",
                          return_value={"ok":True,"state":"installed","version":"test"}) as mock:
            result = HOST.handle({"protocol":1,"action":"installTool","toolId":"yt-dlp",
                "confirmation":"explicit-user-action","url":"https://evil.example/program",
                "path":"/tmp/hijack"})
            self.assertTrue(result["ok"])
            self.assertEqual(mock.call_count, 1)
            self.assertNotIn("url", mock.call_args.kwargs)

if __name__ == "__main__":
    unittest.main()
