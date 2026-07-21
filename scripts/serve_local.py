#!/usr/bin/env python3
"""Serve the static repository locally with its production /bdpc/ base path."""
from __future__ import annotations

import argparse
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit, urlunsplit


class BasePathHandler(SimpleHTTPRequestHandler):
    """Map the production /bdpc/ prefix to the repository root."""

    def do_GET(self) -> None:  # noqa: N802 - inherited HTTP handler API
        if self.path == "/bdpc":
            self.send_response(301)
            self.send_header("Location", "/bdpc/")
            self.end_headers()
            return
        super().do_GET()

    def translate_path(self, path: str) -> str:
        """Remove only the exact production base prefix before resolution."""
        split = urlsplit(path)
        route = split.path
        if route.startswith("/bdpc/"):
            route = route.removeprefix("/bdpc")
        translated = urlunsplit(("", "", route, split.query, split.fragment))
        return super().translate_path(translated)


def main() -> int:
    """Start a localhost-only review server."""
    parser = argparse.ArgumentParser()
    parser.add_argument("--port", type=int, default=8766)
    args = parser.parse_args()
    root = Path(__file__).resolve().parents[1]
    if not (root / ".git").is_file():
        raise SystemExit(f"Expected Git worktree root: {root}")
    handler = partial(BasePathHandler, directory=str(root))
    with ThreadingHTTPServer(("127.0.0.1", args.port), handler) as server:
        print(f"Serving {root} at http://127.0.0.1:{args.port}/bdpc/", flush=True)
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            print("Local review server stopped.", flush=True)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
