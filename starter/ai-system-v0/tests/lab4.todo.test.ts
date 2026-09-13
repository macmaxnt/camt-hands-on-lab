import assert from "node:assert/strict";
import test from "node:test";
import {
  EVALUATION_CASES,
  EVALUATION_SET_VERSION,
  evaluateReleaseGate,
  recordReleaseDecision,
  runLocalEvaluation,
  scoreCase,
  validateAndRecordFeedback,
  validateEvaluationSet,
} from "../lib/evaluation";

test("the evaluation set is versioned and every case declares an expected outcome", () => {
  assert.ok(EVALUATION_SET_VERSION.length > 0, "set version must be present");
  assert.equal(EVALUATION_CASES.length, 12, "must have 12 evaluation cases");

  validateEvaluationSet(EVALUATION_CASES);

  for (const c of EVALUATION_CASES) {
    assert.equal(c.setVersion, EVALUATION_SET_VERSION);
    assert.ok(c.caseId.startsWith("C"), "case ID should start with C");
    assert.ok(c.expectedOutcome, "each case must have an expected outcome");
    assert.ok(typeof c.expectedCitationSupport === "boolean");
    assert.ok(typeof c.expectedSafeStop === "boolean");
    assert.ok(typeof c.expectedAccessResult === "boolean");
    assert.ok(typeof c.releaseBlocking === "boolean");
  }
});

test("citation support and safe-stop results are measured for each evaluation case", () => {
  const { results, gate } = runLocalEvaluation();
  assert.equal(results.length, 12);
  assert.ok(gate);

  for (const r of results) {
    assert.ok(typeof r.citationSupport === "boolean");
    assert.ok(typeof r.safeStop === "boolean");
    assert.ok(typeof r.passed === "boolean");
    assert.ok(typeof r.latencyMs === "number" && r.latencyMs >= 0);
    assert.ok(["available", "unavailable"].includes(r.tokenStatus));
    assert.ok(["available", "unavailable"].includes(r.costStatus));
    assert.ok(["blocking", "informational"].includes(r.releaseImpact));
  }
});

test("evaluation records exclude raw prompts, drafts, evidence text, and personal data", () => {
  const { results } = runLocalEvaluation();
  const forbiddenKeys = ["prompt", "rawPrompt", "draft", "body", "evidenceText", "content", "pii", "secret"];

  for (const r of results) {
    const keys = Object.keys(r);
    for (const fk of forbiddenKeys) {
      assert.ok(!keys.includes(fk), `Result record must not contain key: ${fk}`);
    }
    // Citation fingerprints should be short compact tokens, not raw text
    for (const fp of r.citationFingerprints) {
      assert.ok(fp.length <= 64, "citation fingerprint must be bounded");
      assert.ok(!fp.includes(" "), "fingerprint must not contain raw text spaces");
    }
  }
});

test("a provider or quota failure selects only the approved fallback or safe-error path", () => {
  const { results } = runLocalEvaluation();
  const failureCase = results.find((r) => r.caseId === "C12-provider-failure");
  assert.ok(failureCase, "C12 provider failure case must exist");

  assert.equal(failureCase.actualOutcome, "provider_unavailable");
  assert.ok(failureCase.safeStop, "must safely stop on provider outage");
  assert.ok(
    failureCase.errorCategory === "rate_limited" || failureCase.errorCategory === "provider_outage",
    "must classify as rate limited or provider outage"
  );
  assert.equal(failureCase.passed, true, "handled provider outage must satisfy the expected safe unavailable outcome");
});

test("feedback payloads are validated, bounded, and privacy-minimised", () => {
  // 1. Valid feedback with PII that must be redacted
  const rawNote = "Call me back at 081-234-5678 or john.doe@example.com immediately!";
  const fb = validateAndRecordFeedback({
    rating: 4,
    category: "citation",
    note: rawNote,
    traceId: "test-trace-12345",
  });

  assert.ok(fb.id.startsWith("fb-"));
  assert.equal(fb.rating, 4);
  assert.equal(fb.category, "citation");
  assert.ok(!fb.sanitizedNote.includes("john.doe@example.com"), "Email must be redacted");
  assert.ok(!fb.sanitizedNote.includes("081-234-5678"), "Phone must be redacted");
  assert.ok(fb.sanitizedNote.includes("[REDACTED]"));
  assert.ok(fb.traceFingerprint && fb.traceFingerprint.length === 16);

  // 2. Invalid feedback must be rejected
  assert.throws(() => {
    validateAndRecordFeedback({ rating: 10 as any, category: "accuracy" });
  }, /Rating must be an integer between 1 and 5/);

  assert.throws(() => {
    validateAndRecordFeedback({ rating: 3, category: "invalid-cat" as any });
  }, /Invalid feedback category/);
});

test("release criteria block release when a required evaluation case fails", () => {
  // Create a failing case scenario
  const failingCase = EVALUATION_CASES[0];
  const failingResult = scoreCase(
    failingCase,
    "grounded",
    ["cite-unauthorized-fake"], // bad citation
    false,
    true,
    "malformed_output",
    50
  );

  const gate = evaluateReleaseGate([failingResult]);
  assert.equal(gate.technicalPass, false, "Technical pass must be false when a blocking case fails");
  assert.ok(gate.blockingReasons.length > 0, "Must list blocking reasons");

  // Attempting to record a release when gate has not passed must throw
  assert.throws(() => {
    recordReleaseDecision("run-fail", "Tester", "Cannot verify all cases yet", "release", gate.technicalPass);
  }, /Cannot release when technical gate has not passed/);
});

test("a release decision records its evidence and a documented limitation", () => {
  const { gate, runId } = runLocalEvaluation();
  assert.equal(gate.technicalPass, true, "Local evaluation should technically pass");

  // Missing reviewer name must throw
  assert.throws(() => {
    recordReleaseDecision(runId, "", "Valid limitation text here", "release", gate.technicalPass);
  }, /named human reviewer is required/);

  // Short limitation must throw
  assert.throws(() => {
    recordReleaseDecision(runId, "Smart W.", "too short", "release", gate.technicalPass);
  }, /honest limitation of at least 10 characters is required/);

  // Valid release decision
  const validRecord = recordReleaseDecision(
    runId,
    "Smart Wattanapornmongkol",
    "Evaluation suite tests synthetic scenarios; does not prove performance on arbitrary unindexed PDFs.",
    "release",
    gate.technicalPass
  );

  assert.ok(validRecord.id.startsWith("decision-"));
  assert.equal(validRecord.decision, "release");
  assert.equal(validRecord.reviewerName, "Smart Wattanapornmongkol");
  assert.ok(validRecord.honestLimitation.length >= 10);
  assert.ok(validRecord.createdAt);
});
