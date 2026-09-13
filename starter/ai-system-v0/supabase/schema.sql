-- Extension
CREATE EXTENSION IF NOT EXISTS vector;

-- 1. Documents table
CREATE TABLE IF NOT EXISTS ai_documents (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  access_level TEXT NOT NULL CHECK (access_level IN ('public', 'staff')),
  sha256 TEXT NOT NULL,
  page_count INTEGER NOT NULL,
  source_path TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Chunks table with pgvector embedding
CREATE TABLE IF NOT EXISTS ai_chunks (
  id TEXT PRIMARY KEY,
  document_id TEXT NOT NULL REFERENCES ai_documents(id) ON DELETE CASCADE,
  page_start INTEGER NOT NULL,
  page_end INTEGER NOT NULL,
  content TEXT NOT NULL,
  citation_fingerprint TEXT NOT NULL,
  embedding vector(384),
  access_level TEXT NOT NULL CHECK (access_level IN ('public', 'staff')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Quarantine table
CREATE TABLE IF NOT EXISTS ai_quarantine_chunks (
  id TEXT PRIMARY KEY,
  chunk_id TEXT NOT NULL,
  document_id TEXT NOT NULL,
  quarantined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reason TEXT NOT NULL,
  fingerprint TEXT NOT NULL
);

-- 4. Audit events table (privacy-minimised)
CREATE TABLE IF NOT EXISTS ai_audit_events (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  request_fingerprint TEXT NOT NULL,
  answer_fingerprint TEXT,
  role TEXT NOT NULL CHECK (role IN ('public', 'staff')),
  mode TEXT NOT NULL CHECK (mode IN ('keyword', 'semantic')),
  language TEXT NOT NULL CHECK (language IN ('en', 'th')),
  decision TEXT NOT NULL,
  reason_codes TEXT[] NOT NULL DEFAULT '{}',
  authorized_chunk_count INTEGER NOT NULL DEFAULT 0,
  citation_chunk_ids TEXT[] NOT NULL DEFAULT '{}',
  incident_found BOOLEAN NOT NULL DEFAULT FALSE
);

-- 5. Evaluation runs and Release decisions
CREATE TABLE IF NOT EXISTS ai_evaluation_runs (
  id TEXT PRIMARY KEY,
  set_version TEXT NOT NULL,
  total_cases INTEGER NOT NULL,
  passed_cases INTEGER NOT NULL,
  technical_pass BOOLEAN NOT NULL,
  blocking_reasons TEXT[] NOT NULL DEFAULT '{}',
  evaluated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_release_decisions (
  id TEXT PRIMARY KEY,
  run_id TEXT NOT NULL REFERENCES ai_evaluation_runs(id),
  decision TEXT NOT NULL CHECK (decision IN ('release', 'no_release')),
  reviewer_name TEXT NOT NULL,
  honest_limitation TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. User feedback table
CREATE TABLE IF NOT EXISTS ai_user_feedback (
  id TEXT PRIMARY KEY,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  category TEXT NOT NULL CHECK (category IN ('accuracy', 'citation', 'safety', 'general')),
  sanitized_note TEXT,
  trace_fingerprint TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
