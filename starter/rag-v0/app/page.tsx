"use client";

import { FormEvent, useMemo, useState } from "react";
import { documents, type AnswerResult, type RetrievalMode, answerQuestion } from "../lib/rag";

type Language = "en" | "th";

const copy = {
  en: {
    eyebrow: "AIAT x CAMT · Lab 1",
    title: "Trustworthy RAG Assistant",
    subtitle: "Lab 1 starter — retrieval and grounded answering are intentionally not implemented.",
    prompt: "Ask about AI in education…",
    ask: "Ask",
    retrieval: "Retrieval strategy",
    keyword: "Keyword / document store",
    semantic: "Semantic / vector index",
    retrievalHint: "rag-v0 keeps this control visible, but it does not retrieve or answer yet.",
    system: "System map",
    systemText: "This screen shows the components you will connect in Lab 1. The starter deliberately does not use a hidden fallback answer, so a response cannot look grounded before retrieval exists.",
    sources: "Sources",
    library: "Document library",
    empty: "Ask a question to see the intentional starting-state response.",
    notImplemented: "Not implemented in rag-v0",
    buildNext: "Build next",
    buildSteps: "1. Ingest and chunk the corpus  2. Retrieve relevant chunks  3. Return a cited answer or a safe response",
    grounded: "Grounded answer",
    ambiguous: "Needs clarification",
    not_found: "Not supported by this corpus",
    score: "Similarity",
    boundary: "Boundary: local corpus only · no web · no tools · no API key",
    example: "Try: How should a school protect learner data when using GenAI?",
  },
  th: {
    eyebrow: "AIAT x CAMT · Lab 1",
    title: "ผู้ช่วย RAG ที่ไว้ใจได้",
    subtitle: "จุดเริ่มต้น Lab 1 — ยังไม่ได้สร้าง retrieval และ grounded answer โดยตั้งใจ",
    prompt: "ถามเรื่อง AI ในการศึกษา…",
    ask: "ถาม",
    retrieval: "กลยุทธ์การค้นคืนข้อมูล",
    keyword: "คำสำคัญ / document store",
    semantic: "ความหมาย / vector index",
    retrievalHint: "rag-v0 แสดง control นี้ไว้ แต่ยังไม่ค้นคืนหรือสร้างคำตอบ",
    system: "แผนที่ระบบ",
    systemText: "หน้านี้แสดงองค์ประกอบที่ต้องเชื่อมใน Lab 1 Starter ตั้งใจไม่ใช้คำตอบ fallback ที่ซ่อนอยู่ จึงไม่มีคำตอบใดดูเหมือนมีหลักฐานก่อนสร้าง retrieval จริง",
    sources: "แหล่งข้อมูล",
    library: "คลังเอกสาร",
    empty: "ถามคำถามเพื่อดู starting-state response ที่ตั้งใจไว้",
    notImplemented: "ยังไม่ได้สร้างใน rag-v0",
    buildNext: "สิ่งที่ต้องสร้างต่อ",
    buildSteps: "1. ingest และ chunk corpus  2. ค้นคืน chunk ที่เกี่ยวข้อง  3. คืนคำตอบพร้อม citation หรือ safe response",
    grounded: "คำตอบจากหลักฐาน",
    ambiguous: "ต้องการคำถามที่ชัดเจนขึ้น",
    not_found: "ไม่มีหลักฐานในคลังนี้",
    score: "ความคล้าย",
    boundary:
      "ขอบเขต: ใช้คลังในเครื่องเท่านั้น · ไม่ค้นเว็บ · ไม่เรียกเครื่องมือ · ไม่ต้องมี API key",
    example: "ลองถาม: โรงเรียนควรคุ้มครองข้อมูลผู้เรียนอย่างไรเมื่อใช้ GenAI?",
  },
} as const;

function Status({
  result,
  language,
}: {
  result: AnswerResult;
  language: Language;
}) {
  const text = copy[language];
  const label =
    result.status === "not_implemented"
      ? text.notImplemented
      : result.status === "grounded"
        ? text.grounded
        : result.status === "ambiguous"
          ? text.ambiguous
          : text.not_found;
  return <span className={`status ${result.status}`}>{label}</span>;
}

export default function Home() {
  const [language, setLanguage] = useState<Language>("en");
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState<AnswerResult | null>(null);
  const [mode, setMode] = useState<RetrievalMode>("semantic");
  const text = copy[language];
  const visibleDocuments = useMemo(() => documents, []);

  function ask(event: FormEvent) {
    event.preventDefault();
    if (question.trim()) setResult(answerQuestion(question, language, mode));
  }

  return (
    <main>
      <header className="hero">
        <div>
          <p className="eyebrow">{text.eyebrow}</p>
          <h1>{text.title}</h1>
          <p className="subtitle">{text.subtitle}</p>
        </div>
        <div className="language" aria-label="Language">
          <button
            className={language === "en" ? "selected" : ""}
            onClick={() => setLanguage("en")}
          >
            EN
          </button>
          <button
            className={language === "th" ? "selected" : ""}
            onClick={() => setLanguage("th")}
          >
            ไทย
          </button>
        </div>
      </header>

      <section className="chat-card" aria-label="Question and answer">
        <section className="system-map" aria-label={text.system}>
          <div><p className="eyebrow">{text.system}</p><strong>Approved documents</strong><span>chunk + metadata</span></div>
          <div><strong>Document store</strong><span>exact records + keywords</span></div>
          <div><strong>Vector index</strong><span>related meaning</span></div>
          <div><strong>Grounded answer</strong><span>TODO: citation or safe response</span></div>
        </section>
        <form onSubmit={ask}>
          <label htmlFor="question">{text.example}</label>
          <fieldset className="retrieval-mode">
            <legend>{text.retrieval}</legend>
            <label><input type="radio" checked={mode === "keyword"} onChange={() => setMode("keyword")} /> {text.keyword}</label>
            <label><input type="radio" checked={mode === "semantic"} onChange={() => setMode("semantic")} /> {text.semantic}</label>
          </fieldset>
          <div className="question-row">
            <input
              id="question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder={text.prompt}
            />
            <button type="submit">{text.ask}</button>
          </div>
        </form>
        <p className="retrieval-hint">{text.retrievalHint}</p>
        {!result ? (
          <p className="empty">{text.empty}</p>
        ) : (
          <article className="answer">
            <Status result={result} language={language} />
            <p>{result.answer}</p>
            {result.status === "not_implemented" && (
              <div className="implementation-steps">
                <strong>{text.buildNext}</strong>
                <span>{text.buildSteps}</span>
              </div>
            )}
            {result.citations.length > 0 && (
              <div className="citations">
                <h2>{text.sources}</h2>
                {result.citations.map((citation) => (
                  <a
                    className="citation"
                    href={citation.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    key={citation.chunkId}
                  >
                    <strong>
                      {language === "th" ? citation.titleTh : citation.titleEn}
                    </strong>
                    <span>{citation.excerpt}</span>
                    <small>
                      {text.score}: {Math.round(citation.score * 100)}% ·{" "}
                      {citation.sourcePage}
                    </small>
                  </a>
                ))}
              </div>
            )}
          </article>
        )}
      </section>

      <section className="principle"><p className="eyebrow">{text.system}</p><h2>{text.system}</h2><p>{text.systemText}</p></section>

      <section className="library" aria-label="Document library">
        <div className="section-heading">
          <p className="eyebrow">{text.sources}</p>
          <h2>{text.library}</h2>
        </div>
        <div className="document-grid">
          {visibleDocuments.map((document) => (
            <article className="document" key={document.id}>
              <span>UNESCO · CC BY-SA 3.0 IGO</span>
              <h3>{language === "th" ? document.titleTh : document.titleEn}</h3>
              <p>{language === "th" ? document.textTh : document.textEn}</p>
              <a href={document.sourceUrl} target="_blank" rel="noreferrer">
                {document.sourcePage}
              </a>
            </article>
          ))}
        </div>
      </section>
      <footer>{text.boundary}</footer>
    </main>
  );
}
