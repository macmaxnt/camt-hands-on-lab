# AIAT x CAMT Hands-on Labs

Public learner materials for the AIAT x CAMT hands-on labs. The repository contains only datasets, runnable starter projects, and notebooks.

## Start with Lab 1: Trustworthy RAG

1. Open [notebooks/01_retrieval_basics.ipynb](notebooks/01_retrieval_basics.ipynb) in Google Colab.
2. In the repository root, run `npm install` and `npm run dev`.
3. Open `http://localhost:3000` to use the starter application in [starter/rag-v0](starter/rag-v0).

The application uses only its approved local data, displays citations, and declines unsupported questions.

## Repository contents

- `data/`: approved UNESCO source material, parsed PDF text, and the offline fallback index.
- `notebooks/`: interactive learning notebooks.
- `starter/`: Lab 1's runnable `rag-v0` starter and reserved starter folders for later labs.

## Requirements

- Node.js 20 for the starter application.
- A Google account and Google Colab for the notebook.
