"""Tiny static dev server for the prototype: like `python3 -m http.server`, but sends
Cache-Control: no-store so edits to CSS/JS show up on a normal reload.
Usage: python3 serve.py [port]   (default 5180)"""
import http.server
import sys


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, max-age=0")
        super().end_headers()


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 5180
    http.server.ThreadingHTTPServer.allow_reuse_address = True
    with http.server.ThreadingHTTPServer(("", port), NoCacheHandler) as srv:
        srv.serve_forever()
