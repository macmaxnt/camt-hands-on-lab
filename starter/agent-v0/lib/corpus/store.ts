import Database from "better-sqlite3";
import * as sqliteVec from "sqlite-vec";
import type { AccessLevel, UserRole } from "../contracts";
import type { AuditRecord, SecurityRepository } from "../security";
import type { DocumentChunk, DocumentDetail, DocumentSummary, RetrievedChunk } from "./types";

export class SeedCorpusStore implements SecurityRepository {
  private readonly database: Database.Database;

  constructor(databasePath: string) {
    this.database = new Database(databasePath);
    this.database.pragma("foreign_keys = ON");
    sqliteVec.load(this.database);
    this.ensureSecuritySchema();
  }

  close() { this.database.close(); }

  listDocuments(role: UserRole): DocumentSummary[] {
    const rows = this.database.prepare(`${documentSelect()} WHERE ${accessClause()} ORDER BY d.id`).all(role) as Array<Record<string, unknown>>;
    return rows.map(toSummary);
  }

  getDocument(id: string): DocumentDetail | null {
    const row = this.database.prepare(`${documentSelect()} WHERE d.id = ?`).get(id) as Record<string, unknown> | undefined;
    if (!row) return null;
    const chunks = this.database.prepare(`
      SELECT c.id, c.ordinal, c.document_id, c.text, c.page_start, c.page_end, c.token_count,
        e.model_id, e.runtime_model_id, e.dimensions, e.embedded_at
      FROM chunks c JOIN chunk_embeddings e ON e.chunk_id = c.id
      WHERE c.document_id = ? ORDER BY c.ordinal
    `).all(id) as Array<Record<string, unknown>>;
    return { ...toSummary(row), chunks: chunks.map(toChunk) };
  }

  getSourceFilename(id: string): string | null {
    const row = this.database.prepare("SELECT stored_filename FROM documents WHERE id = ?").get(id) as { stored_filename: string } | undefined;
    return row?.stored_filename ?? null;
  }

  searchKeyword(text: string, limit: number, role: UserRole): RetrievedChunk[] {
    const match = toTrigramMatch(text);
    if (!match) return [];
    const rows = this.database.prepare(`
      SELECT c.id, c.ordinal, c.document_id, c.text, c.page_start, c.page_end, c.token_count,
        e.model_id, e.runtime_model_id, e.dimensions, e.embedded_at,
        m.title, m.access_level, bm25(chunk_search) AS score
      FROM chunk_search
      JOIN chunks c ON c.id = chunk_search.rowid
      JOIN documents d ON d.id = c.document_id
      JOIN document_metadata m ON m.document_id = d.id
      JOIN chunk_embeddings e ON e.chunk_id = c.id
      WHERE chunk_search MATCH ? AND d.status = 'ready' AND ${accessClause()} AND ${notQuarantinedClause()}
      ORDER BY score ASC LIMIT ?
    `).all(match, role, limit) as Array<Record<string, unknown>>;
    return rows.map(toRetrievedChunk);
  }

  searchSemantic(embedding: string | Uint8Array, limit: number, role: UserRole): RetrievedChunk[] {
    const rows = this.database.prepare(`
      SELECT c.id, c.ordinal, c.document_id, c.text, c.page_start, c.page_end, c.token_count,
        e.model_id, e.runtime_model_id, e.dimensions, e.embedded_at,
        m.title, m.access_level, v.distance AS score
      FROM chunk_vectors v
      JOIN chunks c ON c.id = v.rowid
      JOIN documents d ON d.id = c.document_id
      JOIN document_metadata m ON m.document_id = d.id
      JOIN chunk_embeddings e ON e.chunk_id = c.id
      WHERE v.embedding MATCH ? AND k = ? AND d.status = 'ready' AND ${accessClause()} AND ${notQuarantinedClause()}
      ORDER BY v.distance ASC
    `).all(embedding, limit, role) as Array<Record<string, unknown>>;
    return rows.map(toRetrievedChunk);
  }

  firstStoredVector(): Uint8Array {
    const row = this.database.prepare("SELECT embedding FROM chunk_vectors LIMIT 1").get() as { embedding?: Uint8Array } | undefined;
    if (!row?.embedding) throw new Error("Seed corpus has no vectors.");
    return row.embedding;
  }

  quarantineChunk(input: { chunkId: number; reasonCode: string; detectorVersion: string; contentFingerprint: string }): boolean {
    const result = this.database.prepare(`
      INSERT INTO security_chunk_flags (chunk_id, status, reason_code, detector_version, content_fingerprint, detected_at)
      VALUES (?, 'quarantined', ?, ?, ?, ?)
      ON CONFLICT(chunk_id) DO NOTHING
    `).run(input.chunkId, input.reasonCode, input.detectorVersion, input.contentFingerprint, new Date().toISOString());
    return result.changes === 1;
  }

  recordAudit(event: AuditRecord): void {
    this.database.prepare(`
      INSERT INTO audit_events (
        id, created_at, request_fingerprint, answer_fingerprint, role, retrieval_mode, language,
        decision, reason_codes_json, authorized_chunk_count, citation_chunk_ids_json, incident_found
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      event.id, event.createdAt, event.requestFingerprint, event.answerFingerprint, event.role, event.mode, event.language,
      event.decision, JSON.stringify(event.reasonCodes), event.authorizedChunkCount, JSON.stringify(event.citationChunkIds), event.incidentFound ? 1 : 0,
    );
  }

  listAuditEvents(limit: number): AuditRecord[] {
    const rows = this.database.prepare(`
      SELECT id, created_at, request_fingerprint, answer_fingerprint, role, retrieval_mode, language,
        decision, reason_codes_json, authorized_chunk_count, citation_chunk_ids_json, incident_found
      FROM audit_events ORDER BY created_at DESC LIMIT ?
    `).all(limit) as Array<Record<string, unknown>>;
    return rows.map((row) => ({
      id: String(row.id), createdAt: String(row.created_at), requestFingerprint: String(row.request_fingerprint),
      answerFingerprint: row.answer_fingerprint == null ? null : String(row.answer_fingerprint), role: String(row.role) as UserRole,
      mode: String(row.retrieval_mode) as AuditRecord["mode"], language: String(row.language) as AuditRecord["language"],
      decision: String(row.decision) as AuditRecord["decision"], reasonCodes: JSON.parse(String(row.reason_codes_json)) as string[],
      authorizedChunkCount: Number(row.authorized_chunk_count), citationChunkIds: JSON.parse(String(row.citation_chunk_ids_json)) as string[],
      incidentFound: Number(row.incident_found) === 1,
    }));
  }

  private ensureSecuritySchema() {
    this.database.exec(`
      CREATE TABLE IF NOT EXISTS security_chunk_flags (
        chunk_id INTEGER PRIMARY KEY REFERENCES chunks(id) ON DELETE CASCADE,
        status TEXT NOT NULL CHECK(status IN ('quarantined')),
        reason_code TEXT NOT NULL,
        detector_version TEXT NOT NULL,
        content_fingerprint TEXT NOT NULL,
        detected_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS security_chunk_flags_status_idx ON security_chunk_flags(status);
      CREATE TABLE IF NOT EXISTS audit_events (
        id TEXT PRIMARY KEY,
        created_at TEXT NOT NULL,
        request_fingerprint TEXT NOT NULL,
        answer_fingerprint TEXT,
        role TEXT NOT NULL CHECK(role IN ('public', 'staff')),
        retrieval_mode TEXT NOT NULL CHECK(retrieval_mode IN ('keyword', 'semantic')),
        language TEXT NOT NULL CHECK(language IN ('en', 'th')),
        decision TEXT NOT NULL CHECK(decision IN ('allow', 'refuse_input', 'refuse_pii', 'no_authorized_evidence', 'unsafe_output')),
        reason_codes_json TEXT NOT NULL,
        authorized_chunk_count INTEGER NOT NULL,
        citation_chunk_ids_json TEXT NOT NULL,
        incident_found INTEGER NOT NULL CHECK(incident_found IN (0, 1))
      );
      CREATE INDEX IF NOT EXISTS audit_events_created_at_idx ON audit_events(created_at DESC);
    `);
  }
}

function documentSelect() {
  return `
    SELECT d.id, d.original_filename, d.page_count,
      m.access_level, m.title, m.owner, m.audience, m.review_date, m.retention_category, m.tags_json,
      m.adversarial_fixture, m.fixture_type,
      (SELECT COUNT(*) FROM chunks c WHERE c.document_id = d.id) AS chunk_count,
      (SELECT e.model_id FROM chunk_embeddings e JOIN chunks c ON c.id = e.chunk_id WHERE c.document_id = d.id LIMIT 1) AS model_id,
      (SELECT e.dimensions FROM chunk_embeddings e JOIN chunks c ON c.id = e.chunk_id WHERE c.document_id = d.id LIMIT 1) AS dimensions
    FROM documents d JOIN document_metadata m ON m.document_id = d.id
  `;
}

function accessClause() { return "(m.access_level = 'public' OR ? = 'staff')"; }
function notQuarantinedClause() { return "NOT EXISTS (SELECT 1 FROM security_chunk_flags sf WHERE sf.chunk_id = c.id AND sf.status = 'quarantined')"; }

function toSummary(row: Record<string, unknown>): DocumentSummary {
  return {
    id: String(row.id),
    title: String(row.title),
    originalFilename: String(row.original_filename),
    accessLevel: String(row.access_level) as AccessLevel,
    owner: String(row.owner),
    audience: String(row.audience),
    reviewDate: String(row.review_date),
    retentionCategory: String(row.retention_category),
    tags: JSON.parse(String(row.tags_json)) as string[],
    adversarialFixture: Number(row.adversarial_fixture) === 1,
    fixtureType: row.fixture_type == null ? null : String(row.fixture_type),
    pageCount: Number(row.page_count),
    chunkCount: Number(row.chunk_count),
    embeddingModel: String(row.model_id),
    embeddingDimensions: Number(row.dimensions),
  };
}

function toChunk(row: Record<string, unknown>): DocumentChunk {
  return {
    id: Number(row.id), ordinal: Number(row.ordinal), documentId: String(row.document_id), text: String(row.text),
    pageStart: Number(row.page_start), pageEnd: Number(row.page_end), tokenCount: Number(row.token_count),
    embeddingModel: String(row.model_id), embeddingRuntime: String(row.runtime_model_id),
    embeddingDimensions: Number(row.dimensions), embeddedAt: String(row.embedded_at),
  };
}

function toRetrievedChunk(row: Record<string, unknown>): RetrievedChunk {
  return {
    ...toChunk(row), documentName: String(row.title), accessLevel: String(row.access_level) as AccessLevel, score: Number(row.score),
  };
}

function toTrigramMatch(text: string): string | null {
  const terms = text.match(/[\p{L}\p{M}\p{N}]{3,}/gu) ?? [];
  return terms.length ? terms.map((term) => `"${term.replace(/"/gu, "")}"`).join(" OR ") : null;
}
