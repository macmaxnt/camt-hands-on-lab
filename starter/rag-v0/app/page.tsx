"use client";

import { FormEvent, useMemo, useState } from "react";
import { documents, type AnswerResult, type RetrievalMode, answerQuestion } from "../lib/rag";

type Language = "en" | "th";

const copy = {
  en: {
    eyebrow: "AIAT x CAMT · Lab 1",
    title: "Trustworthy RAG Assistant",
    subtitle: "Answers only from the approved UNESCO learning corpus.",
    prompt: "Ask about AI in education…",
    ask: "Ask",
    retrieval: "Retrieval strategy",
    keyword: "Keyword / document store",
    semantic: "Semantic / vector index",
    retrievalHint: "Retrieval selects approved evidence before the system answers.",
    system: "System map",
    systemText: "Documents and metadata live in the document store. Chunks can also live in a vector index. This starter uses a compact fallback; the notebook parses the full 48-page source PDF. Both methods return evidence, then the answer stays within it.",
    sources: "Sources",
    library: "Document library",
    empty: "Ask a focused question to inspect evidence before the answer.",
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
    subtitle: "ตอบจากคลังความรู้ UNESCO เท่านั้น",
    prompt: "ถามเรื่อง AI ในการศึกษา…",
    ask: "ถาม",
    retrieval: "กลยุทธ์การค้นคืนข้อมูล",
    keyword: "คำสำคัญ / document store",
    semantic: "ความหมาย / vector index",
    retrievalHint: "Retrieval เลือกหลักฐานที่อนุมัติก่อนระบบจะตอบ",
    system: "แผนที่ระบบ",
    systemText: "เอกสารและ metadata อยู่ใน document store ส่วน chunk อาจอยู่ใน vector index ได้ Starter นี้ใช้ fallback ขนาดเล็ก ส่วน notebook จะแยก PDF แหล่งข้อมูลจริง 48 หน้า ทั้งสองวิธีคืนหลักฐาน แล้วคำตอบต้องอยู่ในขอบเขตของหลักฐานนั้น",
    sources: "แหล่งข้อมูล",
    library: "คลังเอกสาร",
    empty: "ถามคำถามที่เฉพาะเจาะจง แล้วตรวจหลักฐานก่อนอ่านคำตอบ",
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
    result.status === "grounded"
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
          <div><strong>Bounded answer</strong><span>citation or refusal</span></div>
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
