import Database from "better-sqlite3";
import * as sqliteVec from "sqlite-vec";
import type { AccessLevel } from "../contracts";
import type { DocumentChunk, DocumentDetail, DocumentSummary, RetrievedChunk } from "./types";

export class SeedCorpusStore {
  private readonly database: Database.Database;

  constructor(databasePath: string) {
    this.database = new Database(databasePath);
    this.database.pragma("foreign_keys = ON");
    sqliteVec.load(this.database);
  }

  close() { this.database.close(); }

  listDocuments(): DocumentSummary[] {
    const rows = this.database.prepare(`${documentSelect()} ORDER BY d.id`).all() as Array<Record<string, unknown>>;
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

  searchKeyword(text: string, limit: number): RetrievedChunk[] {
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
      WHERE chunk_search MATCH ? AND d.status = 'ready'
      ORDER BY score ASC LIMIT ?
    `).all(match, limit) as Array<Record<string, unknown>>;
    // TODO(Lab 2): resolve a signed server session and filter m.access_level here.
    return rows.map(toRetrievedChunk);
  }

  searchSemantic(embedding: string | Uint8Array, limit: number): RetrievedChunk[] {
    const rows = this.database.prepare(`
      SELECT c.id, c.ordinal, c.document_id, c.text, c.page_start, c.page_end, c.token_count,
        e.model_id, e.runtime_model_id, e.dimensions, e.embedded_at,
        m.title, m.access_level, v.distance AS score
      FROM chunk_vectors v
      JOIN chunks c ON c.id = v.rowid
      JOIN documents d ON d.id = c.document_id
      JOIN document_metadata m ON m.document_id = d.id
      JOIN chunk_embeddings e ON e.chunk_id = c.id
      WHERE v.embedding MATCH ? AND k = ? AND d.status = 'ready'
      ORDER BY v.distance ASC
    `).all(embedding, limit) as Array<Record<string, unknown>>;
    // TODO(Lab 2): apply the authorized access-level constraint before returning vec hits.
    return rows.map(toRetrievedChunk);
  }

  firstStoredVector(): Uint8Array {
    const row = this.database.prepare("SELECT embedding FROM chunk_vectors LIMIT 1").get() as { embedding?: Uint8Array } | undefined;
    if (!row?.embedding) throw new Error("Seed corpus has no vectors.");
    return row.embedding;
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
