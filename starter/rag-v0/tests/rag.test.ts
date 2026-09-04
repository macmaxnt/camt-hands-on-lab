import assert from "node:assert/strict";
import test from "node:test";
import { answerQuestion, fallbackQueryVector, localCorpusAdapter } from "../lib/rag";

test("retrieves a cited grounded answer for learner data", () => {
  const result = answerQuestion("How should a school protect learner data when using GenAI?");
  assert.equal(result.status, "grounded");
  assert.equal(result.citations[0].documentId, "data-privacy");
  assert.ok(result.citations[0].score > 0.7);
});

test("returns a safe refusal for a claim outside the corpus", () => {
  const result = answerQuestion("What is the CAMT tuition fee for next semester?");
  assert.equal(result.status, "not_found");
  assert.equal(result.citations.length, 0);
});

test("asks to clarify a broad AI policy question", () => {
  const result = answerQuestion("Should schools use AI?");
  assert.equal(result.status, "ambiguous");
});

test("maps Thai privacy vocabulary to the fallback vector", () => {
  assert.ok(fallbackQueryVector("โรงเรียนควรคุ้มครองข้อมูลผู้เรียนอย่างไร")[1] > 0);
});

test("keeps retrieval behind the local corpus adapter", () => {
  assert.equal(localCorpusAdapter.search("privacy data")[0].document.id, "data-privacy");
});

test("supports an inspectable keyword retrieval path", () => {
  const result = answerQuestion("learner data privacy", "en", "keyword");
  assert.equal(result.status, "grounded");
  assert.equal(result.citations[0].documentId, "data-privacy");
});
