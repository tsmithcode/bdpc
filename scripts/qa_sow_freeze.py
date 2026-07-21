#!/usr/bin/env python3
"""Verify the immutable SOW archive, source marker, checksum, and print geometry."""
from __future__ import annotations

import hashlib
import json
from pathlib import Path

from qa_print_pdf import verify_pdf


def sha256_path(path: Path) -> str:
    """Return the SHA-256 digest of a file."""
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for block in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def main() -> int:
    """Validate the frozen HTML/PDF relationship and archive manifest."""
    root = Path(__file__).resolve().parents[1]
    manifest_path = root / "sow/archive/freeze-manifest.json"
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    freeze_id = manifest["freeze_id"]
    sow_path = root / "sow/index.html"
    pdf_path = root / manifest["pdf"]
    sow_text = sow_path.read_text(encoding="utf-8")
    if f'data-sow-freeze-id="{freeze_id}"' not in sow_text:
        raise ValueError("Current SOW does not carry the frozen manifest ID")
    if sha256_path(sow_path) != manifest["source_html_sha256"]:
        raise ValueError("Frozen SOW HTML checksum changed; create an explicit superseding revision")
    if sha256_path(pdf_path) != manifest["pdf_sha256"]:
        raise ValueError("Frozen SOW PDF checksum changed")
    pages, blocks = verify_pdf(pdf_path)
    print(f"PASS: {freeze_id}; HTML/PDF hashes match; {pages} US Letter pages; {blocks} in-bounds text blocks")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
