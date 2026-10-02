from __future__ import annotations

import os
import threading
import webbrowser
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parent
os.chdir(ROOT)


class NoCacheHandler(SimpleHTTPRequestHandler):
    def end_headers(self) -> None:
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

    def log_message(self, format: str, *args: object) -> None:
        print(f"[newd] {self.address_string()} - {format % args}")


server = ThreadingHTTPServer(("127.0.0.1", 0), NoCacheHandler)
port = server.server_address[1]
url = f"http://127.0.0.1:{port}/index.html"

print()
print("========================================")
print(" newd MVP test is running")
print(f" {url}")
print(" Keep this window open while testing.")
print(" Press Ctrl+C to stop.")
print("========================================")
print()

threading.Timer(0.7, lambda: webbrowser.open(url)).start()

try:
    server.serve_forever()
except KeyboardInterrupt:
    print("\nStopping newd...")
finally:
    server.server_close()
