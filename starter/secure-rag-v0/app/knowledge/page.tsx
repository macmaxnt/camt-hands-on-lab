"use client";

import { useEffect, useState } from "react";
import type { DocumentDetail, DocumentSummary } from "../../lib/corpus/types";

type Language = "en" | "th";
const copy = {
  en: { eyebrow: "AIAT × CAMT · Lab 2", title: "Seeded knowledge-base ledger", subtitle: "The supplied manifest and SQLite metadata are shown together. Inspection is intentionally not access controlled.", warning: "ACCESS CONTROL NOT IMPLEMENTED YET — public/staff labels do not restrict this ledger, chunk detail, or source PDFs.", chat: "RAG chat", security: "Security backlog", documents: "documents", name: "Document", classification: "Classification", pages: "Pages", chunks: "Chunks", embedding: "Embedding", inspect: "Inspect", source: "Open source PDF", close: "Close", select: "Select a document to inspect its metadata and chunks.", owner: "Owner", audience: "Audience", review: "Review date", retention: "Retention", tags: "Tags", fixture: "Adversarial fixture", page: "Page", runtime: "Runtime", no: "No", yes: "Yes", loading: "Loading seeded ledger…" },
  th: { eyebrow: "AIAT × CAMT · Lab 2", title: "ทะเบียนคลังความรู้ที่เตรียมไว้", subtitle: "แสดง manifest ที่ให้มาและ SQLite metadata ร่วมกัน การตรวจดูยังไม่มี access control โดยตั้งใจ.", warning: "ยังไม่ได้สร้าง ACCESS CONTROL — ป้าย public/staff ไม่จำกัด ledger, detail ของ chunk หรือ PDF ต้นฉบับ.", chat: "RAG chat", security: "รายการความปลอดภัย", documents: "เอกสาร", name: "เอกสาร", classification: "ชั้นข้อมูล", pages: "หน้า", chunks: "Chunks", embedding: "Embedding", inspect: "ดูรายละเอียด", source: "เปิด PDF ต้นฉบับ", close: "ปิด", select: "เลือกเอกสารเพื่อดู metadata และ chunk.", owner: "เจ้าของ", audience: "กลุ่มเป้าหมาย", review: "วันทบทวน", retention: "การเก็บรักษา", tags: "ป้ายกำกับ", fixture: "adversarial fixture", page: "หน้า", runtime: "Runtime", no: "ไม่ใช่", yes: "ใช่", loading: "กำลังโหลด ledger…" },
} as const;

export default function KnowledgePage() {
  const [language, setLanguage] = useState<Language>("en");
  const [documents, setDocuments] = useState<DocumentSummary[]>([]);
  const [selected, setSelected] = useState<DocumentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const text = copy[language];

  useEffect(() => { void fetch("/api/knowledge/documents", { cache: "no-store" }).then((response) => response.json() as Promise<{ documents: DocumentSummary[] }>).then((data) => setDocuments(data.documents)).catch(() => setDocuments([])).finally(() => setLoading(false)); }, []);
  async function inspect(id: string) {
    const response = await fetch(`/api/knowledge/documents/${id}`, { cache: "no-store" });
    const data = await response.json() as { document?: DocumentDetail };
    setSelected(data.document ?? null);
  }

  return <main className="lab">
    <header className="hero"><div><p className="eyebrow">{text.eyebrow}</p><h1>{text.title}</h1><p className="subtitle">{text.subtitle}</p></div><div className="header-actions"><nav><a href="/">{text.chat}</a><a href="/security">{text.security}</a></nav><div className="language" aria-label="Language"><button className={language === "en" ? "selected" : ""} onClick={() => setLanguage("en")}>EN</button><button className={language === "th" ? "selected" : ""} onClick={() => setLanguage("th")}>ไทย</button></div></div></header>
    <p className="warning" role="alert">{text.warning}</p>
    <section className="ledger"><div className="section-heading"><div><p className="eyebrow">{documents.length} {text.documents}</p><h2>{text.title}</h2></div><p>SQLite + SQLite-vec · intfloat/multilingual-e5-small · 384D</p></div>{loading ? <p className="empty">{text.loading}</p> : <div className="table-wrap"><table><thead><tr><th>{text.name}</th><th>{text.classification}</th><th>{text.pages}</th><th>{text.chunks}</th><th>{text.embedding}</th><th /></tr></thead><tbody>{documents.map((document) => <tr key={document.id}><td><strong>{document.title}</strong><span className="subdata">{document.originalFilename}{document.adversarialFixture ? ` · ${text.fixture}: ${document.fixtureType}` : ""}</span></td><td><span className={`access ${document.accessLevel}`}>{document.accessLevel}</span></td><td>{document.pageCount}</td><td>{document.chunkCount}</td><td>{document.embeddingDimensions}D</td><td><button className="text-button" onClick={() => void inspect(document.id)}>{text.inspect}</button></td></tr>)}</tbody></table></div>}</section>
    <section className="inspection"><div className="inspection-heading"><div><p className="eyebrow">Source inspection</p><h2>{selected?.title ?? text.select}</h2></div>{selected ? <button className="text-button" onClick={() => setSelected(null)}>{text.close}</button> : null}</div>{selected ? <><div className="metadata-grid"><p><span>{text.classification}</span><b className={`access ${selected.accessLevel}`}>{selected.accessLevel}</b></p><p><span>{text.owner}</span><b>{selected.owner}</b></p><p><span>{text.audience}</span><b>{selected.audience}</b></p><p><span>{text.review}</span><b>{selected.reviewDate}</b></p><p><span>{text.retention}</span><b>{selected.retentionCategory}</b></p><p><span>{text.tags}</span><b>{selected.tags.join(", ")}</b></p><p><span>{text.fixture}</span><b>{selected.adversarialFixture ? `${text.yes} · ${selected.fixtureType}` : text.no}</b></p><p><span>{text.embedding}</span><b>{selected.embeddingModel} · {selected.embeddingDimensions}D</b></p></div><a className="source-link" href={`/api/knowledge/documents/${selected.id}/file`} target="_blank" rel="noreferrer">{text.source}</a><div className="chunk-list">{selected.chunks.map((chunk) => <article className="chunk-card" key={chunk.id}><div><span>#{String(chunk.ordinal).padStart(2, "0")}</span><span>{text.page} {chunk.pageStart}{chunk.pageEnd !== chunk.pageStart ? `–${chunk.pageEnd}` : ""} · {chunk.tokenCount} tokens</span></div><p>{chunk.text}</p><small>{chunk.embeddingModel} · {text.runtime}: {chunk.embeddingRuntime} · {chunk.embeddingDimensions}D</small></article>)}</div></> : <p className="empty">{text.select}</p>}</section>
  </main>;
}
