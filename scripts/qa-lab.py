#!/usr/bin/env python3
"""Local-only manual QA server. Does not launch browsers or accept remote clients."""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

FIXTURES = Path(__file__).resolve().parent.parent / "tests" / "fixtures"
HOST = "127.0.0.1"
PORT = 8765

class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(FIXTURES), **kwargs)

if __name__ == "__main__":
    if not (FIXTURES / "qa-lab.html").is_file():
        raise SystemExit("Missing DK Live Block QA fixture")
    with ThreadingHTTPServer((HOST, PORT), Handler) as server:
        print("DK Live Block QA: http://127.0.0.1:8765/qa-lab.html")
        print("Local only, no browser auto-open. Ctrl+C to stop.")
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            print("\nQA lab stopped.")
