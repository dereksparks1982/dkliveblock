#!/usr/bin/env python3
"""Offline test-suite inventory gate. Never runs a browser or downloads files."""
from __future__ import annotations
import re
from pathlib import Path

ROOT=Path(__file__).resolve().parent.parent
RUNNER=ROOT/"scripts"/"test-local.sh"
def verify(root:Path=ROOT,runner:Path=RUNNER):
    errors=[]
    text=runner.read_text(encoding="utf-8")
    expected={p.relative_to(root).as_posix() for p in (root/"tests").glob("*.test.js")}
    listed=re.findall(r'\btests/[a-zA-Z0-9_-]+\.test\.js\b',text)
    missing=sorted(expected-set(listed))
    extras=sorted(set(listed)-expected)
    duplicates=sorted({s for s in listed if listed.count(s)>1})
    for label,items in [("Node tests omitted",missing),("Unknown Node tests",extras),
                        ("Duplicate Node tests",duplicates)]:
        if items:errors.append(label+": "+", ".join(items))
    python_expected={p.relative_to(root).as_posix()
       for p in (root/"scripts").glob("test-*.py")
       if p.name!="test-suite-inventory.py"}
    python_listed=re.findall(r'\bscripts/test-[a-zA-Z0-9_-]+\.py\b',text)
    missing_python=sorted(python_expected-set(python_listed))
    if missing_python:errors.append("Python tests omitted: "+", ".join(missing_python))
    if "python3 scripts/test-suite-inventory.py" not in text:
        errors.append("Inventory check is not part of local suite")
    if text.count("--test-concurrency=2")!=2:
        errors.append("Both Node test phases must cap worker concurrency at 2")
    if ".github/workflows" not in text:errors.append("Missing no-Actions guard")
    return errors,len(expected),len(python_expected)+1

if __name__=="__main__":
    problems,node_count,python_count=verify()
    if problems:
        for error in problems:print("PHASE FAIL:",error)
        raise SystemExit(1)
    print(f"PHASE PASS: {node_count} Node test files and {python_count} Python test scripts inventoried")
    print("NOTE: Inventory coverage is not proof that the test cases passed.")
