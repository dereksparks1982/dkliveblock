#!/usr/bin/env python3
"""Build 25: offline quality, progress and cancellation regression tests."""
from __future__ import annotations
import os
from pathlib import Path
import sys
import tempfile
import threading
import unittest
from unittest.mock import patch

ROOT=Path(__file__).resolve().parent.parent
sys.path.insert(0,str(ROOT/"companion"))
import download_jobs as J

class StreamingJobsTest(unittest.TestCase):
    def test_progress_parsing_is_bounded(self):
        for string, expected in (("DK_PROGRESS: 0.0%",0.0),("DK_PROGRESS: 45.25%",45.2),
                                 ("[download] DK_PROGRESS: 89.1%",89.1),
                                 ("DK_PROGRESS:100%",100)):
            self.assertAlmostEqual(J.parse_progress(string),expected,places=1)
        for string in ("100%", "DK_PROGRESS:101%", "DK_PROGRESS:90%;rm -rf",
                       "DK_PROGRESS:-1%", "random output", "DK_PROGRESS:nan%"):
            self.assertIsNone(J.parse_progress(string))

    @patch.object(J.verified_install,"already_installed",return_value=True)
    @patch.object(J.verified_install,"compatible_platform",return_value=True)
    def test_quality_selection_and_rejects_bad_ids(self,*_):
        with tempfile.TemporaryDirectory() as tmp:
            base=Path(tmp)/"deps"
            with patch.object(J.video_download,"download_folder",return_value=Path(tmp)/"downloads"), \
                 patch.object(J,"find_ffmpeg",return_value="/usr/bin/ffmpeg"):
                for mode in ("compatible","best","audio"):
                    args, output = J.make_command("dQw4w9WgXcQ",mode,base)
                    self.assertEqual(args[-1],"https://www.youtube.com/watch?v=dQw4w9WgXcQ")
                    self.assertIn("--ignore-config",args)
                    self.assertIn("--no-playlist",args)
                    self.assertEqual(output,Path(tmp)/"downloads")
                    if mode=="best":
                        self.assertIn("--ffmpeg-location",args)
                    else:
                        self.assertNotIn("--ffmpeg-location",args)
                for mode in ("; rm -rf", "auto", "", None):
                    with self.assertRaises(ValueError):
                        J.make_command("dQw4w9WgXcQ",mode,base)
                with self.assertRaises(ValueError):
                    J.make_command("../../unsafe","compatible",base)

    @patch.object(J.verified_install,"already_installed",return_value=True)
    @patch.object(J.verified_install,"compatible_platform",return_value=True)
    def test_high_quality_refuses_missing_ffmpeg(self,*_):
        with tempfile.TemporaryDirectory() as tmp:
            with patch.object(J.video_download,"download_folder",return_value=Path(tmp)/"output"), \
                 patch.object(J,"find_ffmpeg",return_value=None):
                with self.assertRaisesRegex(ValueError,"requires FFmpeg"):
                    J.make_command("dQw4w9WgXcQ","best",Path(tmp))
                self.assertNotIn("--ffmpeg-location",
                    J.make_command("dQw4w9WgXcQ","compatible",Path(tmp))[0])

    def test_streaming_progress_without_real_ytdlp(self):
        with tempfile.TemporaryDirectory() as tmp:
            command=[sys.executable,"-u","-c",
                     "print('DK_PROGRESS: 12.0%',flush=True);print('DK_PROGRESS: 91.0%',flush=True)"]
            events=[]
            with patch.object(J,"make_command",return_value=(command,Path(tmp))):
                outcome=J.run("dQw4w9WgXcQ","compatible",events.append,threading.Event())
            self.assertTrue(outcome["ok"])
            self.assertEqual(outcome["state"],"complete")
            self.assertEqual([e["percent"] for e in events],[12.0,91.0])

    def test_running_process_can_be_cancelled(self):
        with tempfile.TemporaryDirectory() as tmp:
            command=[sys.executable,"-u","-c","import time;print('DK_PROGRESS: 5%',flush=True);time.sleep(20)"]
            cancel=threading.Event()
            timer=threading.Timer(0.35,cancel.set)
            try:
                timer.start()
                with patch.object(J,"make_command",return_value=(command,Path(tmp))):
                    result=J.run("dQw4w9WgXcQ","compatible",lambda _:None,cancel)
                self.assertEqual(result["state"],"cancelled")
            finally:
                timer.cancel()


    def test_retry_is_explicit_and_phase_markers_do_not_leak_filename(self):
        import download_jobs as J
        self.assertEqual(J.classify_phase('[Merger] Merging formats into "/private/path"'),"merging")
        self.assertEqual(J.classify_phase('[ExtractAudio] Destination: song.m4a'),"processing")
        self.assertIsNone(J.classify_phase('[download] Destination: hidden-url'))
        self.assertIsNone(J.classify_phase('noise'))
        with tempfile.TemporaryDirectory() as tmp:
            with patch.object(J.verified_install,"compatible_platform",return_value=True), \
                 patch.object(J.verified_install,"already_installed",return_value=True), \
                 patch.object(J.video_download,"download_folder",return_value=Path(tmp)/"downloads"), \
                 patch.object(J,"find_ffmpeg",return_value=None):
                argv,_=J.make_command("dQw4w9WgXcQ","compatible",Path(tmp)/"dependencies")
                self.assertIn("--continue",argv)
                self.assertNotIn("--no-continue",argv)
                self.assertIn("--no-overwrites",argv)

if __name__=="__main__":
    unittest.main()
