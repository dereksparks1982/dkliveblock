#!/usr/bin/env python3
"""Offline, mocked Build 24 download command tests: never call yt-dlp."""
from __future__ import annotations
from pathlib import Path
import sys
import tempfile
import unittest
from unittest.mock import patch
sys.path.insert(0,str(Path(__file__).resolve().parent.parent/"companion"))
import video_download as D
class Result:
    returncode=0
class DownloadTests(unittest.TestCase):
    @patch.object(D.verified_install,"compatible_platform",return_value=True)
    @patch.object(D.verified_install,"already_installed",return_value=True)
    def test_safe_argv_with_canonical_url_only(self,*_):
        calls=[]
        with tempfile.TemporaryDirectory() as tmp:
            with patch.object(D,"download_folder",return_value=Path(tmp)/"downloads"):
                output=D.download("dQw4w9WgXcQ",Path(tmp)/"deps",runner=lambda a,**kw:(calls.append((a,kw)) or Result()))
                self.assertEqual(output["state"],"complete")
        argv,kwargs=calls[0]
        self.assertEqual(argv[-1],"https://www.youtube.com/watch?v=dQw4w9WgXcQ")
        self.assertIn("--no-playlist",argv)
        self.assertIn("--ignore-config",argv)
        self.assertEqual(kwargs["timeout"],900)
        self.assertNotIn("shell",kwargs)
    def test_bad_video_ids_are_rejected(self):
        for v in ("../../shadow","a"*12,";rm -rf ~","https://youtube.com",""):
            with self.assertRaises(ValueError):
                D.download(v)
    @patch.object(D.verified_install,"compatible_platform",return_value=True)
    @patch.object(D.verified_install,"already_installed",return_value=False)
    def test_unverified_binary_never_runs(self,*_):
        with tempfile.TemporaryDirectory() as tmp:
            with self.assertRaises(ValueError):
                D.download("dQw4w9WgXcQ",Path(tmp),runner=lambda *a,**k: self.fail("Unexpected execution"))
    def test_native_host_rejects_unapproved_video_download(self):
        import native_host as H
        self.assertFalse(H.handle({"protocol":1,"action":"downloadVideo","videoId":"dQw4w9WgXcQ"})["ok"])
        with patch.object(D,"download",return_value={"ok":True,"state":"complete"}) as mocked:
            result=H.handle({"protocol":1,"action":"downloadVideo","videoId":"dQw4w9WgXcQ",
                             "confirmation":"explicit-user-action","url":"https://evil.example/",
                             "path":"/tmp/foreign"})
            self.assertTrue(result["ok"])
            mocked.assert_called_once_with("dQw4w9WgXcQ")

if __name__=="__main__":
    unittest.main()
