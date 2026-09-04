import fallbackIndex from "../../../data/fallback-index.json";

export type Language = "en" | "th";
export type AnswerStatus = "grounded" | "ambiguous" | "not_found";
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

export interface SearchResult {
  document: SourceDocument;
  score: number;
}

export const documents: SourceDocument[] = [
  { id: "human-centred", chunkId: "human-centred-01", titleEn: "Human-centred use of GenAI", titleTh: "การใช้ GenAI ที่ยึดมนุษย์เป็นศูนย์กลาง", textEn: "Human agency is a core consideration when education systems design or adopt generative AI. Learners should understand what a tool can and cannot reliably do.", textTh: "อำนาจการตัดสินใจของมนุษย์ต้องเป็นประเด็นหลักเมื่อสถานศึกษานำ GenAI มาใช้ ผู้เรียนควรเข้าใจว่าเครื่องมือทำอะไรได้และทำอะไรไม่ได้อย่างน่าเชื่อถือ", sourceUrl: "https://unesdoc.unesco.org/ark:/48223/pf0000386693", sourcePage: "Guidance, Chapter 4, p. 21" },
  { id: "data-privacy", chunkId: "data-privacy-01", titleEn: "Protecting learner data", titleTh: "การคุ้มครองข้อมูลของผู้เรียน", textEn: "Education providers should tell learners what data a GenAI system may collect, how it may use those data, and how this may affect their education and wider lives.", textTh: "ผู้ให้บริการการศึกษาควรแจ้งผู้เรียนว่า GenAI อาจเก็บข้อมูลใด ใช้ข้อมูลอย่างไร และอาจส่งผลต่อการศึกษาและชีวิตของผู้เรียนอย่างไร", sourceUrl: "https://unesdoc.unesco.org/ark:/48223/pf0000386693", sourcePage: "Guidance, Chapter 4, p. 24" },
  { id: "bias-validation", chunkId: "bias-validation-01", titleEn: "Validate bias and representation", titleTh: "ตรวจสอบอคติและความครอบคลุมของข้อมูล", textEn: "Validation mechanisms should examine bias, including gender bias, and whether training data represent diversity across disability, status, culture, and geography.", textTh: "กลไกตรวจสอบควรพิจารณาอคติ รวมถึงอคติทางเพศ และตรวจว่าข้อมูลฝึกครอบคลุมความหลากหลายด้านความพิการ สถานะ วัฒนธรรม และภูมิศาสตร์หรือไม่", sourceUrl: "https://unesdoc.unesco.org/ark:/48223/pf0000386693", sourcePage: "Guidance, Chapter 4, p. 24" },
  { id: "pedagogical-validation", chunkId: "pedagogical-validation-01", titleEn: "Pedagogical appropriateness", titleTh: "ความเหมาะสมด้านการสอน", textEn: "The choice and use of GenAI should be proportionate to learners' age, the expected outcome, and the kind of knowledge or problem being addressed. It should make learning more effective than an alternative approach.", textTh: "การเลือกและใช้ GenAI ควรเหมาะสมกับอายุของผู้เรียน ผลลัพธ์ที่คาดหวัง และชนิดของความรู้หรือปัญหา เครื่องมือควรทำให้การเรียนมีประสิทธิภาพกว่าทางเลือกอื่น", sourceUrl: "https://unesdoc.unesco.org/ark:/48223/pf0000386693", sourcePage: "Guidance, Chapter 5.2, p. 29" },
  { id: "human-agency", chunkId: "human-agency-01", titleEn: "Human control and accountability", titleTh: "การควบคุมและความรับผิดชอบของมนุษย์", textEn: "Educators, learners, and researchers should control the process of using GenAI. People remain accountable for accuracy, learning strategies, and effects on human behaviour.", textTh: "ครู ผู้เรียน และนักวิจัยควรควบคุมกระบวนการใช้ GenAI มนุษย์ยังรับผิดชอบต่อความถูกต้อง กลยุทธ์การเรียนรู้ และผลกระทบต่อพฤติกรรมของมนุษย์", sourceUrl: "https://unesdoc.unesco.org/ark:/48223/pf0000386693", sourcePage: "Guidance, Chapter 5.2, p. 29" },
  { id: "co-design", chunkId: "co-design-01", titleEn: "Co-design and evaluation", titleTh: "การร่วมออกแบบและประเมินผล", textEn: "Safe and effective educational use of GenAI should be co-designed by teachers, learners, and researchers. It needs piloting and evaluation of effectiveness and long-term impact.", textTh: "การใช้ GenAI ในการศึกษาอย่างปลอดภัยและมีประสิทธิภาพควรร่วมออกแบบโดยครู ผู้เรียน และนักวิจัย ควรมีการทดลองใช้และประเมินประสิทธิผลรวมถึงผลกระทบระยะยาว", sourceUrl: "https://unesdoc.unesco.org/ark:/48223/pf0000386693", sourcePage: "Guidance, Chapter 5.3, p. 33" },
  { id: "teacher-competencies", chunkId: "teacher-competencies-01", titleEn: "Teacher AI competencies", titleTh: "สมรรถนะ AI สำหรับครู", textEn: "The teacher framework organizes capability around a human-centred mindset, ethics of AI, foundations and applications, AI pedagogy, and professional learning.", textTh: "กรอบสมรรถนะสำหรับครูจัดความสามารถไว้ในด้านแนวคิดที่ยึดมนุษย์เป็นศูนย์กลาง จริยธรรม AI พื้นฐานและการประยุกต์ใช้ AI การสอนด้วย AI และการเรียนรู้เพื่อพัฒนาวิชาชีพ", sourceUrl: "https://unesdoc.unesco.org/ark:/48223/pf0000391104", sourcePage: "Teacher framework, overview, p. 12" },
  { id: "student-competencies", chunkId: "student-competencies-01", titleEn: "Student AI competencies", titleTh: "สมรรถนะ AI สำหรับผู้เรียน", textEn: "Learners are responsible users and co-creators of AI. The student framework connects human-centred mindset, ethics, AI techniques, and AI system design across Understand, Apply, and Create.", textTh: "ผู้เรียนเป็นทั้งผู้ใช้ AI อย่างรับผิดชอบและผู้ร่วมสร้าง AI กรอบสำหรับผู้เรียนเชื่อมโยงแนวคิดที่ยึดมนุษย์เป็นศูนย์กลาง จริยธรรม เทคนิค AI และการออกแบบระบบ AI ผ่านระดับ เข้าใจ ประยุกต์ใช้ และสร้าง", sourceUrl: "https://unesdoc.unesco.org/ark:/48223/pf0000391105", sourcePage: "Student framework, Chapter 3 p. 19; Chapter 4 p. 31" }
];

const topicTerms: Record<number, string[]> = {
  0: ["human", "learner", "student", "ผู้เรียน", "มนุษย์", "นักเรียน"],
  1: ["privacy", "data", "collect", "personal", "ข้อมูล", "ความเป็นส่วนตัว", "เก็บ"],
  2: ["ethic", "bias", "fair", "right", "harm", "จริย", "อคติ", "สิทธิ", "อันตราย"],
  3: ["teach", "learn", "school", "class", "pedagog", "การสอน", "การเรียน", "โรงเรียน", "ห้องเรียน"],
  4: ["agency", "control", "accountab", "decision", "responsib", "ควบคุม", "รับผิดชอบ", "ตัดสินใจ", "อำนาจ"],
  5: ["evaluate", "validation", "test", "assess", "pilot", "ประเมิน", "ตรวจสอบ", "ทดสอบ", "ทดลอง"],
  6: ["safe", "safety", "protect", "risk", "secure", "ปลอดภัย", "คุ้มครอง", "ความเสี่ยง"],
  7: ["competenc", "framework", "foundation", "co-creator", "สมรรถนะ", "กรอบ", "พื้นฐาน", "ร่วมสร้าง"]
};

const stopWords = new Set(["how", "should", "a", "an", "the", "when", "using", "what", "is", "for", "of", "and", "or", "to", "in", "กับ", "และ", "หรือ", "ของ", "ที่", "ควร", "อย่างไร", "เมื่อ"]);

function queryTokens(query: string) {
  return query.toLowerCase().split(/[^a-z0-9ก-๙]+/u).filter((token) => token.length > 1 && !stopWords.has(token));
}

function cosine(left: number[], right: number[]) {
  const dot = left.reduce((sum, value, index) => sum + value * right[index], 0);
  const magnitude = (vector: number[]) => Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0));
  const denominator = magnitude(left) * magnitude(right);
  return denominator === 0 ? 0 : dot / denominator;
}

export function fallbackQueryVector(query: string): number[] {
  const normalized = query.toLowerCase();
  return fallbackIndex.dimensions.map((_, index) => topicTerms[index].some((term) => normalized.includes(term)) ? 1 : 0);
}

function isBroad(query: string) {
  const normalized = query.toLowerCase();
  return /should.+(ai|genai)|ควร.+(ai|genai)|what.+ai|อะไร.*ai/.test(normalized) && fallbackQueryVector(query).filter(Boolean).length < 2;
}

function citationFor(document: SourceDocument, score: number, language: Language): Citation {
  return { documentId: document.id, chunkId: document.chunkId, titleEn: document.titleEn, titleTh: document.titleTh, excerpt: language === "th" ? document.textTh : document.textEn, sourceUrl: document.sourceUrl, sourcePage: document.sourcePage, score };
}

/** Local-only corpus adapter: its search surface is intentionally narrow and has no network capability. */
export const localCorpusAdapter = {
  search(question: string, mode: RetrievalMode = "semantic"): SearchResult[] {
    if (mode === "keyword") {
      const tokens = queryTokens(question);
      return documents.map((document) => {
        const haystack = `${document.titleEn} ${document.titleTh} ${document.textEn} ${document.textTh}`.toLowerCase();
        const matches = tokens.filter((token) => haystack.includes(token)).length;
        return { document, score: tokens.length === 0 ? 0 : matches / tokens.length };
      }).sort((left, right) => right.score - left.score);
    }
    const queryVector = fallbackQueryVector(question);
    return fallbackIndex.items
      .map((item) => ({
        document: documents.find((candidate) => candidate.id === item.documentId)!,
        score: cosine(queryVector, item.vector)
      }))
      .sort((left, right) => right.score - left.score);
  }
};

export function answerQuestion(question: string, language: Language = "en", mode: RetrievalMode = "semantic"): AnswerResult {
  if (isBroad(question)) {
    return { status: "ambiguous", answer: language === "th" ? "คำถามนี้กว้างเกินไปสำหรับคลังเอกสารนี้ โปรดระบุเรื่อง เช่น ข้อมูลผู้เรียน อคติ การสอน หรือความรับผิดชอบของมนุษย์" : "This question is too broad for this corpus. Please specify a focus such as learner data, bias, pedagogy, or human accountability.", citations: [] };
  }
  const ranked = localCorpusAdapter.search(question, mode);
  const best = ranked[0];
  if (!best || best.score < 0.35) {
    return { status: "not_found", answer: language === "th" ? "ฉันไม่พบหลักฐานที่อนุมัติในคลังนี้สำหรับคำถามดังกล่าว จึงไม่ควรเดาคำตอบ" : "I cannot find approved evidence for that question in this local corpus, so I should not guess.", citations: [] };
  }
  const document = best.document;
  const content = language === "th" ? document.textTh : document.textEn;
  const prefix = language === "th" ? "จากเอกสารที่ค้นพบ: " : "Based on the retrieved source: ";
  return { status: "grounded", answer: `${prefix}${content}`, citations: [citationFor(document, best.score, language)] };
}
