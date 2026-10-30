#!/usr/bin/env python3
"""Build 24 offline one-file companion package and isolated installation test."""
from __future__ import annotations
import importlib.util
import json
from pathlib import Path
import os
import subprocess
import sys
import tempfile
import unittest
import zipfile

ROOT=Path(__file__).resolve().parent.parent
SCRIPT=ROOT/"scripts"/"make-companion-installer.py"
spec=importlib.util.spec_from_file_location("dk_companion_package",SCRIPT)
PKG=importlib.util.module_from_spec(spec)
spec.loader.exec_module(PKG)

class ZipappTests(unittest.TestCase):
    def test_single_file_has_required_host_modules(self):
        with tempfile.TemporaryDirectory() as temp:
            package=PKG.build(Path(temp)/"companion.pyz")
            with zipfile.ZipFile(package) as archive:
                self.assertEqual(set(archive.namelist()),{"__main__.py","native_host.py","verified_install.py","video_download.py"})
                self.assertIn(b"tkinter",archive.read("__main__.py"))
                self.assertIn(b"allowed_extensions",archive.read("__main__.py"))
    def test_installer_creates_user_files_without_touching_system(self):
        with tempfile.TemporaryDirectory() as temp:
            temp=Path(temp)
            package=PKG.build(temp/"installer.pyz")
            home=temp/"fresh-home"
            home.mkdir()
            env=dict(os.environ,HOME=str(home))
            process=subprocess.run([sys.executable,str(package),"--install"],capture_output=True,text=True,env=env,timeout=20)
            self.assertEqual(process.returncode,0,process.stderr)
            base=home/".local/share/dk-live-block"
            self.assertTrue((base/"dependencies").is_dir())
            for name in ("native_host.py","verified_install.py","video_download.py"):
                self.assertEqual((base/"companion"/name).read_bytes(),(ROOT/"companion"/name).read_bytes())
            reg=json.loads((home/".mozilla/native-messaging-hosts/dk_live_block_companion.json").read_text())
            self.assertEqual(reg["allowed_extensions"],["dk-live-block@elderred-softworks.local"])
if __name__=="__main__":
    unittest.main()
