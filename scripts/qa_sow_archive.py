#!/usr/bin/env python3
"""Verify the checksum and print geometry of the retained prior SOW revision."""
from __future__ import annotations

import hashlib
import json
from pathlib import Path

from qa_print_pdf import verify_pdf


ARCHIVED_REQUIRED_TEXT = (
    "Included scope",
    "Excluded scope",
    "Commercial authorization",
    "Client responsibilities and kickoff gates",
    "Acceptance criteria",
    "Change control",
    "Authorization",
    "$3,200",
    "$1,600",
    "$90/hour",
)


def sha256_path(path: Path) -> str:
    """Return the SHA-256 digest of a file."""
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for block in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def main() -> int:
    """Validate the retained prior revision independently of the current SOW."""
    root = Path(__file__).resolve().parents[1]
    manifest_path = root / "sow/archive/revision-manifest.json"
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    pdf_path = root / manifest["pdf"]
    if sha256_path(pdf_path) != manifest["pdf_sha256"]:
        raise ValueError("Archived SOW PDF checksum changed")
    pages, blocks = verify_pdf(
        pdf_path,
        required_text=ARCHIVED_REQUIRED_TEXT,
        maximum_pages=4,
    )
    print(
        f"PASS: {manifest['archive_id']}; archived PDF hash matches; "
        f"{pages} US Letter pages; {blocks} in-bounds text blocks"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
