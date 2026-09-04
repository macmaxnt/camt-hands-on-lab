# Offline fallback index

`fallback-index.json` is intentionally transparent: each vector is a fixed eight-topic representation, not a hidden language model. It lets every learner complete the lab even when a model download or network fails.

The optional Colab section uses `intfloat/multilingual-e5-small` to rebuild document embeddings. It is suitable for English source passages and Thai learner queries. Do not commit a downloaded model into this repository.

## Parsed full-text source

`parsed/unesco-genai-guidance-pages.jsonl` preserves page-level extraction from the complete 48-page UNESCO guidance. `parsed/unesco-genai-guidance-chunks.jsonl` contains overlapping 180-word chunks with source page metadata. Regenerate both with `scripts/ingest_pdf.py`.
