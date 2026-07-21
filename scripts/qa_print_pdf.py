#!/usr/bin/env python3
"""Verify the browser-rendered SOW PDF uses unclipped US Letter pages."""
from __future__ import annotations

import argparse
import re
from pathlib import Path

import pymupdf


REQUIRED_TEXT = (
    "Included scope",
    "Excluded scope",
    "Commercial authorization",
    "Client responsibilities and kickoff gates",
    "Acceptance criteria",
    "Change control",
    "Authorization",
    "Assignment-ready CAD effort plan",
    "Absolute included ceiling",
    "40.0 hours",
    "Standard setup",
    "Existing floor plan",
    "Proposed floor plan",
    "Site / area plan",
    "$3,200",
    "$1,600",
    "$90/hour",
)


def normalize(text: str) -> str:
    """Collapse PDF line breaks and repeated whitespace for stable assertions."""
    return re.sub(r"\s+", " ", text).strip().casefold()


def verify_pdf(
    pdf_path: Path,
    required_text: tuple[str, ...] = REQUIRED_TEXT,
    maximum_pages: int = 12,
) -> tuple[int, int]:
    """Return page and text-block counts after validating geometry and content."""
    with pymupdf.open(pdf_path) as document:
        if not 1 <= document.page_count <= maximum_pages:
            raise ValueError(f"Unexpected SOW page count: {document.page_count}")
        full_text = normalize("\n".join(page.get_text() for page in document))
        for required in required_text:
            if normalize(required) not in full_text:
                raise ValueError(f"Missing required print text: {required}")

        block_count = 0
        for page_number, page in enumerate(document, start=1):
            if abs(page.rect.width - 612) > 1 or abs(page.rect.height - 792) > 1:
                raise ValueError(
                    f"Page {page_number} is not US Letter: "
                    f"{page.rect.width:.1f} × {page.rect.height:.1f} points"
                )
            for block in page.get_text("blocks"):
                block_count += 1
                x0, y0, x1, y1 = block[:4]
                if x0 < -0.5 or y0 < -0.5 or x1 > page.rect.width + 0.5 or y1 > page.rect.height + 0.5:
                    raise ValueError(f"Text block outside page {page_number} bounds: {(x0, y0, x1, y1)}")
        return document.page_count, block_count


def main() -> int:
    """Validate a browser-generated SOW PDF."""
    parser = argparse.ArgumentParser()
    parser.add_argument("pdf", type=Path)
    args = parser.parse_args()
    pdf_path = args.pdf.expanduser().resolve()
    if not pdf_path.is_file():
        raise SystemExit(f"PDF not found: {pdf_path}")
    page_count, block_count = verify_pdf(pdf_path)
    print(f"PASS: {page_count} US Letter pages; {block_count} in-bounds text blocks; required SOW text present")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
