import assert from "node:assert/strict";
import test from "node:test";
import { answerQuestion, documents } from "../lib/rag";

test("makes the Lab 1 starting state explicit", () => {
  const result = answerQuestion(
    "How should a school protect learner data when using GenAI?",
  );
  assert.equal(result.status, "not_implemented");
  assert.equal(result.citations.length, 0);
  assert.match(result.answer, /not implemented/i);
});

test("keeps the starting-state message bilingual", () => {
  const result = answerQuestion("ข้อมูลผู้เรียน", "th");
  assert.equal(result.status, "not_implemented");
  assert.match(result.answer, /ยังไม่ได้สร้าง/);
});

test("retains source metadata for learners to connect to retrieval", () => {
  assert.ok(documents.length >= 3);
  assert.ok(documents.every((document) => document.chunkId && document.sourceUrl));
});
