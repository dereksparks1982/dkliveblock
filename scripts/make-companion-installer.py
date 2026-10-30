#!/usr/bin/env python3
"""Build a self-contained, optional Linux DK companion installer (unsigned developer artifact).

No network access, sudo, binaries from third parties, or installed dependencies.
This packages the *native companion only*, NOT yt-dlp itself.
"""
from __future__ import annotations
import argparse
from pathlib import Path
import tempfile
import zipapp

ROOT = Path(__file__).resolve().parent.parent
COMPANION = ROOT / "companion"
MODULES = ("native_host.py", "verified_install.py", "video_download.py")
LAUNCHER = '''"""DK Live Block: optional one-file Linux companion setup.
Installation requires an explicit click or --install; never downloads third-party tools.
"""
import json
import os
from pathlib import Path
import sys
import zipfile

REGISTRY_NAME = "dk_live_block_companion.json"
EXTENSION_ID = "dk-live-block@elderred-softworks.local"
FILES = ("native_host.py", "verified_install.py", "video_download.py")

def install():
    if sys.platform != "linux":
        raise RuntimeError("Linux only")
    home = Path.home()
    base = home / ".local" / "share" / "dk-live-block"
    folder = base / "companion"
    deps = base / "dependencies"
    registry = home / ".mozilla" / "native-messaging-hosts" / REGISTRY_NAME
    for directory in (base, folder, deps, registry.parent):
        if directory.is_symlink():
            raise RuntimeError("Refusing to install into a symlinked directory")
        directory.mkdir(parents=True, exist_ok=True)
    if any((folder / name).is_symlink() for name in FILES):
        raise RuntimeError("Refusing to overwrite a symlinked companion component")
    with zipfile.ZipFile(Path(sys.argv[0])) as archive:
        for name in FILES:
            source = archive.read(name)
            dest = folder / name
            temp = folder / ("." + name + ".tmp")
            if temp.is_symlink():
                raise RuntimeError("Refusing symlinked temporary file")
            with temp.open("wb") as output:
                output.write(source)
            os.chmod(temp, 0o700 if name == "native_host.py" else 0o600)
            os.replace(temp, dest)
    manifest = {
       "name": "dk_live_block_companion",
       "description": "DK Live Block optional local tool manager",
       "path": str((folder / "native_host.py").resolve()),
       "type": "stdio",
       "allowed_extensions": [EXTENSION_ID]
    }
    temp = registry.with_suffix(".json.tmp")
    if temp.is_symlink():
        raise RuntimeError("Refusing symlinked registry temporary file")
    temp.write_text(json.dumps(manifest,indent=2) + "\\n",encoding="utf-8")
    os.chmod(temp, 0o600)
    os.replace(temp, registry)
    return str(deps)

def graphical():
    try:
        import tkinter as tk
        from tkinter import messagebox
        window = tk.Tk()
    except (ImportError, RuntimeError, Exception) as error:
        print("Graphical setup unavailable. Run with: python3 dk-live-block-companion-linux.pyz --install",file=sys.stderr)
        return 1
    window.title("DK Live Block Companion")
    window.geometry("470x260")
    tk.Label(window,text="Optional Linux Companion",font=("Sans",17,"bold")).pack(pady=16)
    tk.Label(window,text="Enables optional yt-dlp downloads.\\nBasic DK ad blocking works without it.\\nNo third-party software will be installed automatically.",justify="center").pack(pady=6)
    def clicked():
        if not messagebox.askyesno("Install optional companion","Install the DK Live Block companion for this Linux user?"):
            return
        try:
            directory = install()
            messagebox.showinfo("Installed","DK companion registered.\\nDependencies: " + directory)
        except Exception as error:
            messagebox.showerror("Installation error",str(error))
    tk.Button(window,text="Install DK Companion",command=clicked,padx=15,pady=8).pack(pady=12)
    window.mainloop()
    return 0

if __name__ == "__main__":
    if "--install" in sys.argv[1:]:
        print("DK Live Block optional companion installed. Dependencies directory: " + install())
    else:
        raise SystemExit(graphical())
'''
def build(output: Path):
    for name in MODULES:
        if not (COMPANION / name).is_file():
            raise FileNotFoundError(name)
    output.parent.mkdir(parents=True,exist_ok=True)
    with tempfile.TemporaryDirectory() as temp:
        stage=Path(temp)
        (stage / "__main__.py").write_text(LAUNCHER,encoding="utf-8")
        for name in MODULES:
            (stage / name).write_bytes((COMPANION / name).read_bytes())
        zipapp.create_archive(stage, target=output, interpreter="/usr/bin/env python3", compressed=True)
    output.chmod(0o755)
    return output

if __name__=="__main__":
    parser=argparse.ArgumentParser()
    parser.add_argument("--candidate",action="store_true",help="Explicitly allow creation of an unsigned developer installer")
    args=parser.parse_args()
    if not args.candidate:
        parser.error("Developer companion package requires --candidate; not a public release")
    target=build(ROOT / "dist" / "dk-live-block-companion-linux.pyz")
    print("Unsigned development companion installer: " + str(target))
    print("No software published or installed; local browser testing and signing still required.")
