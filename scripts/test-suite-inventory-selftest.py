#!/usr/bin/env python3
"""Synthetic omissions test for the local inventory gate, without external I/O."""
import importlib.util
import tempfile
from pathlib import Path

spec=importlib.util.spec_from_file_location("inventory",Path(__file__).with_name("test-suite-inventory.py"))
module=importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
with tempfile.TemporaryDirectory(prefix="dklb-inventory-") as folder:
    root=Path(folder)
    (root/"tests").mkdir()
    (root/"scripts").mkdir()
    (root/"tests"/"a.test.js").write_text("'use strict';")
    (root/"tests"/"b.test.js").write_text("'use strict';")
    (root/"scripts"/"test-one.py").write_text("pass\n")
    (root/"scripts"/"test-two.py").write_text("pass\n")
    runner=root/"scripts"/"test-local.sh"
    runner.write_text("node --test --test-concurrency=2 tests/a.test.js\n"
      "node --test --test-concurrency=2 tests/a.test.js\n"
      "python3 scripts/test-one.py\n"
      "python3 scripts/test-suite-inventory.py\n"
      "if [[ -d .github/workflows ]]; then :; fi\n")
    problems,_,_=module.verify(root,runner)
    assert any("Node tests omitted" in p for p in problems),problems
    assert any("Duplicate Node tests" in p for p in problems),problems
    assert any("Python tests omitted" in p for p in problems),problems
    runner.write_text("node --test --test-concurrency=2 tests/a.test.js\n"
      "node --test --test-concurrency=2 tests/b.test.js\n"
      "python3 scripts/test-one.py\n"
      "python3 scripts/test-two.py\n"
      "python3 scripts/test-suite-inventory.py\n"
      "if [[ -d .github/workflows ]]; then :; fi\n")
    assert module.verify(root,runner)[0]==[]
print("PASS: omission, duplicate and Python test inventory failure fixtures.")
