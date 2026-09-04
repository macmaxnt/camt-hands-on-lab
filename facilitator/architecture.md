# Starter architecture / สถาปัตยกรรมเริ่มต้น

The first lab intentionally keeps the components visible:

```text
approved source cards
       ↓ ingest and chunk
document store (text + metadata) ── keyword retrieval
       ↓
vector index (embeddings + chunk IDs) ── semantic retrieval
       ↓
retrieved chunks and citations
       ↓
bounded answer or safe refusal
```

Learners start with local JSON so they can inspect every field. They then discuss which production replacement fits a real system:

- A normal database stores document identity, metadata, permissions, source location, and audit records.
- A full-text index finds exact terms and filters.
- A vector index finds related wording.
- The answer layer must only use retrieved chunks; it does not invent policy or facts.

