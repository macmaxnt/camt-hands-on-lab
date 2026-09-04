export type Language = "en" | "th";

// Lab target states. rag-v0 intentionally returns only "not_implemented".
export type AnswerStatus =
  | "not_implemented"
  | "grounded"
  | "ambiguous"
  | "not_found";
export type RetrievalMode = "keyword" | "semantic";

export interface SourceDocument {
  id: string;
  chunkId: string;
  titleEn: string;
  titleTh: string;
  textEn: string;
  textTh: string;
  sourceUrl: string;
  sourcePage: string;
}

export interface Citation {
  documentId: string;
  chunkId: string;
  titleEn: string;
  titleTh: string;
  excerpt: string;
  sourceUrl: string;
  sourcePage: string;
  score: number;
}

export interface AnswerResult {
  status: AnswerStatus;
  answer: string;
  citations: Citation[];
}

// Approved source metadata for the document-library UI.
// TODO (Lab 1): replace this small sample with chunks loaded from data/corpus.
export const documents: SourceDocument[] = [
  {
    id: "human-centred",
    chunkId: "human-centred-01",
    titleEn: "Human-centred use of GenAI",
    titleTh: "การใช้ GenAI ที่ยึดมนุษย์เป็นศูนย์กลาง",
    textEn:
      "Human agency is a core consideration when education systems design or adopt generative AI.",
    textTh:
      "อำนาจการตัดสินใจของมนุษย์ต้องเป็นประเด็นหลักเมื่อสถานศึกษานำ GenAI มาใช้",
    sourceUrl: "https://unesdoc.unesco.org/ark:/48223/pf0000386693",
    sourcePage: "Guidance, Chapter 4, p. 21",
  },
  {
    id: "data-privacy",
    chunkId: "data-privacy-01",
    titleEn: "Protecting learner data",
    titleTh: "การคุ้มครองข้อมูลของผู้เรียน",
    textEn:
      "Education providers should tell learners what data a GenAI system may collect and how it may use those data.",
    textTh:
      "ผู้ให้บริการการศึกษาควรแจ้งผู้เรียนว่า GenAI อาจเก็บข้อมูลใดและใช้ข้อมูลอย่างไร",
    sourceUrl: "https://unesdoc.unesco.org/ark:/48223/pf0000386693",
    sourcePage: "Guidance, Chapter 4, p. 24",
  },
  {
    id: "human-agency",
    chunkId: "human-agency-01",
    titleEn: "Human control and accountability",
    titleTh: "การควบคุมและความรับผิดชอบของมนุษย์",
    textEn:
      "People remain accountable for accuracy, learning strategies, and effects on human behaviour.",
    textTh:
      "มนุษย์ยังรับผิดชอบต่อความถูกต้อง กลยุทธ์การเรียนรู้ และผลกระทบต่อพฤติกรรมของมนุษย์",
    sourceUrl: "https://unesdoc.unesco.org/ark:/48223/pf0000386693",
    sourcePage: "Guidance, Chapter 5.2, p. 29",
  },
];

/**
 * Lab 1 starting point — intentionally not a working RAG answer.
 *
 * TODO:
 * 1. Ingest and chunk the approved corpus.
 * 2. Retrieve relevant chunks for the selected mode.
 * 3. Apply a threshold and return grounded, ambiguous, or not_found.
 * 4. Build citations only from retrieved chunks.
 */
export function answerQuestion(
  _question: string,
  language: Language = "en",
  _mode: RetrievalMode = "semantic",
): AnswerResult {
  return {
    status: "not_implemented",
    answer:
      language === "th"
        ? "ยังไม่ได้สร้างการค้นคืนข้อมูลและการตอบจากหลักฐานใน rag-v0 เริ่มจาก ingest/chunk เอกสาร แล้วเชื่อม keyword หรือ semantic retrieval ก่อนสร้างคำตอบพร้อม citation"
        : "Retrieval and grounded answering are not implemented in rag-v0 yet. Start by ingesting and chunking the documents, then connect keyword or semantic retrieval before producing a cited answer.",
    citations: [],
  };
}
