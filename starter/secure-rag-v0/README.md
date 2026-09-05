# Secure RAG v0 — Lab 2 fast-start

A runnable Lab 1 RAG baseline for the Lab 2 security exercise. It already searches a synthetic, pre-indexed public/staff corpus and returns cited answers. It is **not secure**: classifications are metadata only until learners build `secure-rag-v2`.

## Setup

```bash
cd starter/secure-rag-v0
npm install
cp .env.example .env.local
npm run dev
```

Set these server-only variables in `.env.local` before asking the model for an answer:

- `OPENAI_BASE_URL` — NVIDIA Build OpenAI-compatible base URL, usually `https://integrate.api.nvidia.com/v1`
- `OPENAI_API_KEY` — NVIDIA Build API key
- `OPENAI_MODEL` — selected chat model
- `OPENAI_DISABLE_THINKING` — optional `true`/`false` override
- `SECURE_RAG_MODEL_CACHE` — optional writable cache for local `Xenova/multilingual-e5-small` query embeddings
- `SECURE_RAG_RUNTIME_DIR` — optional writable directory for the learner runtime database and copied PDFs

The pre-indexed corpus does **not** need an ingestion step or an embedding-model download. A semantic query needs the local E5 runtime; configure a populated cache if the machine cannot download it on first semantic use. Keyword retrieval works without it.

```bash
npm test
npm run build
npm run verify:secure-corpus
```

## Seed bootstrap and reset

The checked-in `data/seed/` directory is read-only starter material: `secure-rag.sqlite`, its manifest, and 48 synthetic source PDFs.

On first server use, the app copies the database and source PDFs to `data/runtime/` (or `SECURE_RAG_RUNTIME_DIR`). It only does this if `knowledge.sqlite` is absent. Once that runtime database exists, the seed is never copied over it; document IDs, chunk IDs, source filenames, pages, vectors, and metadata are left unchanged.

To reset a learner runtime, stop the server and remove only the runtime directory:

```bash
rm -rf data/runtime
# or: rm -rf "$SECURE_RAG_RUNTIME_DIR"
```

Do not run the supplied corpus generation scripts for this lab. They are corpus-production tooling, not application setup. Do not edit or re-embed `data/seed/` unless a documented compatibility fix is essential.

## What works (Lab 1 baseline)

- Seeded SQLite database with FTS5 keyword and SQLite-vec semantic retrieval
- Local multilingual E5 query embeddings (`query:` prefix)
- NVIDIA Build through its OpenAI-compatible chat-completions API
- Grounded, streamed answers with page-level source citations
- Seeded document ledger, metadata, chunks, embedding provenance, and PDF inspection
- Public/staff access labels and adversarial fixture labels in the corpus shape
- English and Thai interface text

## Deliberately incomplete Lab 2 controls

**A public/staff label is not authorization in this starter.** The document list, detail endpoint, source-PDF route, keyword retrieval, semantic retrieval, citations, and LLM context can expose both classifications. The UI states this prominently and does not offer a pretend browser role selector.

Learners implement these controls for the `secure-rag-v2` milestone:

1. Signed HttpOnly demo sessions for `public` and `staff`
2. Server-side authorization from the resolved session
3. Access-filtered FTS5 and SQLite-vec retrieval
4. Access checks on document, detail, source-file, and citation routes
5. Direct prompt-injection checks before retrieval
6. Synthetic PII detection/refusal before any NVIDIA request
7. Indirect-injection filtering for adversarial corpus fixtures
8. Structured model output with validated, authorized citation chunk IDs
9. Privacy-minimised audit-event persistence and display
10. Safe refusals for policy, PII, unavailable access, and unsafe output

The pending tests in `tests/lab2.todo.test.ts` name the security outcomes to implement. They are skipped intentionally so the completed Lab 1 baseline remains runnable.

## SQLite-vec notes

`sqlite-vec` is a native SQLite extension and `better-sqlite3` is a native addon. Use Node 20–22 on a platform with a compatible binary/toolchain, then reinstall dependencies after changing Node versions. If the vector extension cannot load, keyword retrieval and corpus verification will report the platform problem; do not replace or regenerate the supplied database as a workaround.
