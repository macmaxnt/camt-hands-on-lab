# Full PDF source / แหล่งข้อมูล PDF ฉบับเต็ม

`unesco-genai-guidance.pdf` is the complete 48-page *Guidance for generative AI in education and research* (UNESCO, 2023). It is the full-text source for the first RAG ingestion exercise.

The document is distributed under CC BY-SA 3.0 IGO. Keep [../ATTRIBUTION.md](../ATTRIBUTION.md) with any redistribution. The included source is text-only for retrieval; do not reuse the document cover or marked images.

Regenerate the page records and chunks with:

```bash
python scripts/ingest_pdf.py --input corpus/source-pdfs/unesco-genai-guidance.pdf --output-dir data/parsed
```

