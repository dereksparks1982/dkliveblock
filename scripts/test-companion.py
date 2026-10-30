#!/usr/bin/env python3
"""Build 22 offline companion safety checks using only Python standard library."""
from __future__ import annotations
import importlib.util
import json
import os
from pathlib import Path
import struct
import subprocess
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parent.parent
HOST = ROOT / "companion" / "native_host.py"
INSTALLER = ROOT / "scripts" / "install-companion.py"


def module(path, name):
    spec = importlib.util.spec_from_file_location(name, path)
    result = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(result)
    return result


class CompanionTest(unittest.TestCase):
    def test_protocol_has_no_execution_or_arbitrary_path_actions(self):
        host = module(HOST, "dk_native_host")
        self.assertEqual(host.handle({"action":"ping", "protocol":1})["ok"], True)
        self.assertEqual(host.handle({"action":"run", "protocol":1, "command":"rm -rf /"})["ok"], False)
        self.assertEqual(host.handle({"action":"status", "protocol":99})["ok"], False)
        self.assertEqual(host.handle({"action":"install", "protocol":1})["ok"], False)

    def test_safe_local_detection_and_missing_tools(self):
        host = module(HOST, "dk_native_host_detect")
        with tempfile.TemporaryDirectory() as tmp:
            base = Path(tmp)
            yt = base / "yt-dlp" / "yt-dlp"
            yt.parent.mkdir()
            yt.write_text("#!/bin/sh\n", encoding="utf-8")
            yt.chmod(0o700)
            found = host.inspect_tools(base)
            self.assertEqual(found["yt-dlp"]["status"], "local")
            self.assertIn(found["ffmpeg"]["status"], ("system", "missing"))
            target = base / "deno" / "deno"
            target.parent.mkdir()
            target.symlink_to(yt)
            self.assertNotEqual(host.inspect_tools(base)["deno"]["status"], "local")

    def test_native_framing_and_error_handling(self):
        with tempfile.TemporaryDirectory() as tmp:
            env = {**os.environ, "HOME": tmp}
            payload = json.dumps({"action":"status", "protocol":1}).encode()
            request = struct.pack("<I", len(payload)) + payload
            out = subprocess.run([sys.executable, str(HOST)], input=request, capture_output=True, env=env, check=True)
            size = struct.unpack("<I", out.stdout[:4])[0]
            data = json.loads(out.stdout[4:4+size])
            self.assertTrue(data["ok"])
            self.assertEqual(data["directory"], str(Path(tmp) / ".local/share/dk-live-block/dependencies"))
            # A host-wide installation on PATH is permitted; the temporary DK folder is empty.
            self.assertIn(data["tools"]["yt-dlp"]["status"], ("missing", "system"))
            self.assertEqual(out.stderr, b"")
            malformed = subprocess.run([sys.executable, str(HOST)], input=struct.pack("<I", 50000), capture_output=True, env=env)
            self.assertNotEqual(malformed.returncode, 0)

    def test_install_only_creates_user_files(self):
        installer = module(INSTALLER, "dk_installer")
        with tempfile.TemporaryDirectory() as tmp:
            home = Path(tmp)
            deps, manifest_path = installer.install(home, HOST)
            self.assertTrue(deps.is_dir())
            manifest = json.loads(manifest_path.read_text())
            self.assertEqual(manifest["allowed_extensions"], ["dk-live-block@elderred-softworks.local"])
            self.assertEqual(manifest["type"], "stdio")
            self.assertTrue(Path(manifest["path"]).is_file())
            self.assertEqual(manifest_path.parent, home / ".mozilla/native-messaging-hosts")
            self.assertEqual(len(list(deps.iterdir())), 0)


if __name__ == "__main__":
    unittest.main()
