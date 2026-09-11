# Agent v0 — Lab 3 fast-start

This is the completed `secure-rag-v2` milestone used to start Lab 3. The secure RAG chat, staff-session flow, authorized knowledge ledger, security workbench, corpus, and tests are working. `/agent` is a static learning backlog only: it is not an agent, does not run tools, and cannot take external action.

Before changing the app, inspect `/security` and `/agent`.

## Setup

```bash
cd starter/agent-v0
npm install
cp .env.example .env.local
npm run dev
```

Set these server-only variables in `.env.local` before asking the model for an answer:

- `OPENAI_BASE_URL` — NVIDIA Build OpenAI-compatible base URL, usually `https://integrate.api.nvidia.com/v1`
- `OPENAI_API_KEY` — NVIDIA Build API key
- `OPENAI_MODEL` — selected chat model
- `OPENAI_DISABLE_THINKING` — optional `true`/`false` override
- `SESSION_SECRET` — random secret used to sign the staff-session cookie
- `STAFF_PIN_SCRYPT_HASH` — scrypt hash of the shared staff PIN; escape each dollar sign in `.env.local` as `\$`
- `AUDIT_FINGERPRINT_SECRET` — separate HMAC secret for audit, chunk, and citation fingerprints; required in production and must not reuse `SESSION_SECRET`
- `SECURE_RAG_MODEL_CACHE` — optional writable cache for local `Xenova/multilingual-e5-small` query embeddings
- `SECURE_RAG_RUNTIME_DIR` — optional writable directory for the learner runtime database and copied PDFs

Generate the staff-session values without storing a plaintext PIN:

```bash
node -e 'const c=require("crypto"); const pin=process.argv[1]; if(!pin) throw new Error("Pass a PIN"); const N=16384,r=8,p=1,salt=c.randomBytes(16),hash=c.scryptSync(pin,salt,32,{N,r,p}),value=`scrypt$${N}$${r}$${p}$${salt.toString("base64url")}$${hash.toString("base64url")}`; console.log("SESSION_SECRET="+c.randomBytes(32).toString("base64url")); console.log("STAFF_PIN_SCRYPT_HASH="+value.replace(/\$/g,"\\$"))' 'choose-a-staff-pin'
```

Verify the inherited baseline:

```bash
npm test
npm run build
npm run verify:secure-corpus
```

## Seed bootstrap and reset

`data/seed/` is read-only starter material: `secure-rag.sqlite`, its manifest, and 48 synthetic source PDFs. On first server use, the app copies the database and PDFs to `data/runtime/` (or `SECURE_RAG_RUNTIME_DIR`). It does not overwrite an existing runtime database.

Reset only a learner runtime; do not regenerate or edit the supplied corpus:

```bash
rm -rf data/runtime
# or: rm -rf "$SECURE_RAG_RUNTIME_DIR"
```

## Completed secure-RAG v2 baseline

- Signed staff sessions and server-resolved public/staff authorization.
- Role-filtered FTS5 and SQLite-vec retrieval, protected document inspection, and source PDF access.
- Direct injection and PII refusal before retrieval or provider use.
- Indirect-injection detection with persistent poisoned-chunk quarantine.
- Structured provider output with authorized, HMAC-bound citation validation.
- Privacy-minimised, staff-only security audit records that never retain raw prompts or answers.
- English and Thai interface text.

## Deliberately unfinished Lab 3 work

1. Typed task and tool contracts.
2. Server-only bounded coordinator.
3. Authorized search adapter.
4. Constrained draft creation.
5. Version-bound, one-time approval decisions.
6. Minimal task and trace persistence.
7. Strict agent API routes.
8. Task workspace UI.
9. Automated and manual agent scenarios.

The hard boundary is unchanged: no unrestricted web or arbitrary HTTP, shell, database-write, filesystem-write, or third-party action tool. There is no `/api/agent/*` route, task table, planner, approval action, MCP implementation, sandbox, or background job in this starter.

## SQLite-vec notes

`sqlite-vec` is a native SQLite extension and `better-sqlite3` is a native addon. Use Node 20–22 on a platform with a compatible binary/toolchain, then reinstall dependencies after changing Node versions. If the vector extension cannot load, keyword retrieval and corpus verification will report the platform problem; do not replace or regenerate the supplied database as a workaround.
