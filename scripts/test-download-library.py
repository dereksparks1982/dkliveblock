#!/usr/bin/env python3
"""Build 32: offline inventory tests using temporary directories only."""
from __future__ import annotations
import sys
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

ROOT=Path(__file__).resolve().parent.parent
sys.path.insert(0,str(ROOT/"companion"))
import download_library as D
import native_host as HOST

class InventoryTests(unittest.TestCase):
    def test_only_normal_media_files_returned(self):
        with tempfile.TemporaryDirectory() as temp:
            root=Path(temp)/"downloads";root.mkdir()
            for filename in ("video.mp4","song.m4a","clip.mkv","private.part","secret.txt",".hidden.mp4"):
                (root/filename).write_bytes(b"test contents")
            (root/"unsafe.mp4").symlink_to(root/"secret.txt")
            result=D.list_downloads(root)
            self.assertTrue(result["ok"])
            self.assertEqual({x["name"] for x in result["items"]},{"video.mp4","song.m4a","clip.mkv"})
            self.assertTrue(all(set(x)=={"name","size","modified"} for x in result["items"]))
            self.assertFalse(result["truncated"])

    def test_symlinked_directory_rejected(self):
        with tempfile.TemporaryDirectory() as temp:
            root=Path(temp);real=root/"real";real.mkdir()
            shortcut=root/"shortcut";shortcut.symlink_to(real,target_is_directory=True)
            with self.assertRaises(ValueError):
                D.list_downloads(shortcut)

    def test_missing_folder_does_not_get_created(self):
        with tempfile.TemporaryDirectory() as temp:
            root=Path(temp)/"absent"
            self.assertEqual(D.list_downloads(root)["items"],[])
            self.assertFalse(root.exists())

    def test_native_host_has_no_arbitrary_path_option(self):
        with tempfile.TemporaryDirectory() as temp:
            root=Path(temp)
            (root/"video.webm").write_bytes(b"hello")
            with patch.object(D,"list_downloads",return_value={"ok":True,"directory":str(root),"items":[{"name":"video.webm","size":5,"modified":0}],"truncated":False}) as call:
                response=HOST.handle({"action":"listDownloads","protocol":1,"path":"/etc/passwd"})
                self.assertTrue(response["ok"])
                call.assert_called_once_with()

if __name__=="__main__":
    unittest.main()
