# AIAT x CAMT Developer Labs

Four connected, evidence-first AI development labs for GitHub Classroom. Each lab accepts the previous milestone or provides a fast-start starter so learners can recover without rebuilding earlier work.

| Lab | Focus | Starter | Milestone | Status |
| --- | --- | --- | --- | --- |
| 01 | Trustworthy RAG | `starter/rag-v0` | `rag-v1` | Available now |
| 02 | Secure AI | `starter/secure-rag-v0` | `secure-rag-v2` | Scaffolded |
| 03 | Bounded Agentic AI | `starter/agent-v0` | `agent-v3` | Scaffolded |
| 04 | AI-Enabled System | `starter/ai-system-v0` | `system-v4` | Scaffolded |

## Start Lab 1

1. Open [labs/01-rag/README.md](labs/01-rag/README.md).
2. Run [notebooks/01_retrieval_basics.ipynb](notebooks/01_retrieval_basics.ipynb) in Google Colab.
3. At the repository root, run `npm install` and `npm run dev`.
4. Open `http://localhost:3000`, complete the three prompts in [evidence/test-prompts.md](evidence/test-prompts.md), and submit the evidence for `rag-v1`.

## Repository map

- `labs/`: learner-facing objectives, entry points, and expected outputs for each lab.
- `starter/`: fast-start applications. Lab 1 is runnable; future starters are intentionally documented placeholders.
- `milestones/`: cross-lab handoff rules and milestone names.
- `notebooks/`: Colab walkthroughs.
- `corpus/` and `data/`: approved source material, parsed text, and the offline fallback index.
- `facilitator/`, `assessments/`, and `evidence/`: teaching, assessment, and submission materials.
- `slides/`: the current lecture deck.

## Lab 1 safety boundary

The current application retrieves only from its local approved corpus. It exposes lexical and semantic retrieval, shows citations, and declines unsupported claims. It never browses the web, invokes tools, writes data, or presents unsupported claims as answers.

## Instructor release check

Run `npm test` and `npm run build`. Then follow [facilitator/pre-session-checklist.md](facilitator/pre-session-checklist.md). The Forms script requires the instructor's Google account authorization and does not collect learner email addresses.
