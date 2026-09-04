#!/usr/bin/env python3
"""Extract a source PDF into page-level records and overlapping RAG chunks.

Usage:
  python scripts/ingest_pdf.py \
    --input corpus/source-pdfs/unesco-genai-guidance.pdf \
    --output-dir data/parsed

The script deliberately preserves page locations and source metadata. It does not
create embeddings: learners compare keyword retrieval first, then attach a real
embedding model in the notebook.
"""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path

from pypdf import PdfReader

SOURCE = {
    "source_id": "unesco-genai-guidance-2023",
    "title": "Guidance for generative AI in education and research",
    "publisher": "UNESCO",
    "year": 2023,
    "source_url": "https://unesdoc.unesco.org/ark:/48223/pf0000386693",
    "license": "CC BY-SA 3.0 IGO",
    "attribution": "UNESCO. (2023). Guidance for generative AI in education and research.",
}


def normalise(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()


def chunk_words(words: list[str], size: int, overlap: int) -> list[list[str]]:
    if not words:
        return []
    step = size - overlap
    if step <= 0:
        raise ValueError("chunk size must be greater than overlap")
    return [words[start : start + size] for start in range(0, len(words), step)]


def write_jsonl(path: Path, rows: list[dict]) -> None:
    with path.open("w", encoding="utf-8") as handle:
        for row in rows:
            handle.write(json.dumps(row, ensure_ascii=False) + "\n")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", type=Path, required=True)
    parser.add_argument("--output-dir", type=Path, required=True)
    parser.add_argument("--chunk-words", type=int, default=180)
    parser.add_argument("--overlap-words", type=int, default=30)
    args = parser.parse_args()

    reader = PdfReader(args.input)
    args.output_dir.mkdir(parents=True, exist_ok=True)
    pages: list[dict] = []
    chunks: list[dict] = []

    for page_number, page in enumerate(reader.pages, start=1):
        text = normalise(page.extract_text() or "")
        if len(text) < 120:
            continue
        page_record = {**SOURCE, "source_file": args.input.name, "page": page_number, "text": text}
        pages.append(page_record)
        words = text.split()
        for chunk_number, chunk in enumerate(chunk_words(words, args.chunk_words, args.overlap_words), start=1):
            chunks.append({
                **SOURCE,
                "source_file": args.input.name,
                "page_start": page_number,
                "page_end": page_number,
                "chunk_id": f"{SOURCE['source_id']}-p{page_number:02d}-c{chunk_number:02d}",
                "text": " ".join(chunk),
            })

    write_jsonl(args.output_dir / "unesco-genai-guidance-pages.jsonl", pages)
    write_jsonl(args.output_dir / "unesco-genai-guidance-chunks.jsonl", chunks)
    report = {
        **SOURCE,
        "source_file": args.input.name,
        "total_pdf_pages": len(reader.pages),
        "text_pages": len(pages),
        "chunk_count": len(chunks),
        "chunk_words": args.chunk_words,
        "overlap_words": args.overlap_words,
        "source_text_words": sum(len(row["text"].split()) for row in pages),
    }
    (args.output_dir / "unesco-genai-guidance-report.json").write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()

