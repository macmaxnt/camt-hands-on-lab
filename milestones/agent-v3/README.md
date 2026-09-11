# Agent v3 — Lab 3 milestone

This is the completed Lab 3 milestone. It continues the completed `secure-rag-v2` application with a bounded agent workflow. The agent searches authorized knowledge, creates one constrained draft, then waits for an authenticated staff decision. It never sends email, writes to a database, runs code, or takes an external action.

Every earlier control is intact: cited RAG chat, English/Thai interface, signed staff sessions, access-filtered retrieval, input guardrails, poisoned-source quarantine, citation validation, privacy-minimised audits, and the knowledge ledger.

## Setup

```bash
cd milestones/agent-v3
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
- `AUDIT_FINGERPRINT_SECRET` — separate HMAC secret for audit, chunk, citation, task, and draft fingerprints; required in production and must not reuse `SESSION_SECRET`
- `SECURE_RAG_MODEL_CACHE` — optional writable cache for local `Xenova/multilingual-e5-small` query embeddings
- `SECURE_RAG_RUNTIME_DIR` — optional writable directory for the learner runtime database and copied PDFs

Generate the staff-session values without storing a plaintext PIN:

```bash
node -e 'const c=require("crypto"); const pin=process.argv[1]; if(!pin) throw new Error("Pass a PIN"); const N=16384,r=8,p=1,salt=c.randomBytes(16),hash=c.scryptSync(pin,salt,32,{N,r,p}),value=`scrypt$${N}$${r}$${p}$${salt.toString("base64url")}$${hash.toString("base64url")}`; console.log("SESSION_SECRET="+c.randomBytes(32).toString("base64url")); console.log("STAFF_PIN_SCRYPT_HASH="+value.replace(/\$/g,"\\$"))' 'choose-a-staff-pin'
```

Verify the milestone:

```bash
npm test
npm run build
npm run verify:secure-corpus
```

## Bounded agent workflow

- `lib/contracts.ts` holds the strict serializable records: `TaskState`, `ToolName`, `ToolCall`, `EvidenceRef`, `Draft`, `ApprovalDecision`, `TraceEvent`, `TaskSummary`, and `AgentWorkspace`.
- `lib/agent.ts` holds the server-only coordinator, the strict request parsers, the tool allowlist, and the fixed `MAX_AGENT_STEPS` budget.
- `app/api/agent/run/route.ts` and `app/api/agent/approve/route.ts` are the only agent routes. Both derive the role from the signed session cookie.
- `app/agent/page.tsx` is the task workspace with plan, evidence, draft, approval, and trace panels.

Exactly three server-owned tools exist:

```text
search_knowledge_base
create_draft
request_approval
```

The browser cannot select a tool, send tool arguments, set a state transition, or supply a role. Approval is staff-only, bound to one draft version, and accepted once. Stale and duplicate decisions are refused without a second result.

States: `planned`, `awaiting_approval`, `completed`, `declined`, `safely_stopped`.

Runtime task and trace rows store metadata only: state, fingerprint, counts, versions, decisions, and reason codes. Traces never store raw task text, draft text, evidence text, provider messages, or personal data.

## Seed bootstrap and reset

`data/seed/` is read-only starter material: `secure-rag.sqlite`, its manifest, and 48 synthetic source PDFs. On first server use, the app copies the database and PDFs to `data/runtime/` (or `SECURE_RAG_RUNTIME_DIR`). It does not overwrite an existing runtime database.

Reset only a learner runtime; do not regenerate or edit the supplied corpus:

```bash
rm -rf data/runtime
# or: rm -rf "$SECURE_RAG_RUNTIME_DIR"
```

Task and trace tables live in the runtime database, so the reset also clears them.

## Fix the corpus, do not regenerate it

Do not run `scripts/build_secure_seed_db.mjs` or `scripts/generate_seed_pdfs.py` for lab setup. They are corpus-production tooling. Do not edit or re-embed `data/seed/` unless a documented compatibility fix is essential.

## SQLite-vec notes

`sqlite-vec` is a native SQLite extension and `better-sqlite3` is a native addon. Use Node 20–22 on a platform with a compatible binary/toolchain, then reinstall dependencies after changing Node versions. If the vector extension cannot load, keyword retrieval and corpus verification report the platform problem. Do not replace or regenerate the supplied database as a workaround.
