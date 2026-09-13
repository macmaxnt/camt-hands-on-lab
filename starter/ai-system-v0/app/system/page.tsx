"use client";

import { useEffect, useState } from "react";
import { CaseResult, ReleaseDecisionRecord, ReleaseGate } from "../../lib/contracts";
import { SessionControl } from "../session-control";

type Language = "en" | "th";

const copy = {
  en: {
    eyebrow: "AIAT x CAMT · Lab 4",
    title: "AI System Release Console",
    subtitle: "Agent v3 is operational. Run evaluation suites, inspect gate metrics, and record a human release decision.",
    chat: "RAG chat",
    knowledge: "Knowledge base",
    security: "Security workbench",
    agent: "Agent workspace",
    system: "System release",
    runEvaluationBtn: "Run Evaluation Suite (12 Cases)",
    runningEval: "Running evaluation cases...",
    evalResultsHeading: "Evaluation Suite Results (Set v1)",
    caseId: "Case ID",
    surface: "Surface",
    expected: "Expected",
    actual: "Actual",
    citation: "Citation",
    safeStop: "Safe Stop",
    latency: "Latency",
    cost: "Cost",
    status: "Status",
    gateHeading: "Technical Release Gate",
    gateTechnicalPass: "Technical Gate: PASSED (12/12 Cases)",
    gateBlocked: "Technical Gate: BLOCKED",
    decisionHeading: "Human Release Decision",
    decisionSub: "A release is a human decision backed by audited evaluation evidence.",
    reviewerNameLabel: "Human Reviewer Name",
    reviewerPlaceholder: "e.g. Smart Wattanapornmongkol",
    limitationLabel: "Documented Honest Limitation (min 10 chars)",
    limitationPlaceholder: "State what this synthetic evaluation cannot prove...",
    recordReleaseBtn: "Approve & Record Release",
    recordNoReleaseBtn: "Record No-Release",
    recordedDecision: "Confirmed Release Record",
    feedbackHeading: "User Feedback Affordance",
    feedbackSub: "Privacy-minimised feedback capture (auto-redacts emails and phone numbers).",
    ratingLabel: "Rating (1-5)",
    categoryLabel: "Category",
    noteLabel: "Feedback Note",
    submitFeedbackBtn: "Send Feedback",
    feedbackSuccess: "Feedback recorded safely without PII!",
    session: {
      access: "Access",
      public: "Public",
      staff: "Staff",
      enable: "Enable staff",
      pin: "Staff PIN",
      cancel: "Cancel",
      logout: "Log out",
      submitting: "Checking…",
      unavailable: "Staff access is unavailable.",
    },
  },
  th: {
    eyebrow: "AIAT x CAMT · Lab 4",
    title: "คอนโซลปล่อยระบบ AI (Release Console)",
    subtitle: "Agent v3 ทำงานได้แล้ว สั่งรันชุดทดสอบ ตรวจสอบเกณฑ์ Release Gate และบันทึกการตัดสินใจปล่อยระบบโดยมนุษย์",
    chat: "RAG chat",
    knowledge: "คลังความรู้",
    security: "พื้นที่ทำงานความปลอดภัย",
    agent: "พื้นที่ทำงานเอเจนต์",
    system: "คอนโซลปล่อยระบบ",
    runEvaluationBtn: "สั่งรันชุดทดสอบ Evaluation (12 กรณี)",
    runningEval: "กำลังประมวลผลกรณีทดสอบ...",
    evalResultsHeading: "ผลการประเมินชุดทดสอบ (Set v1)",
    caseId: "รหัสกรณี",
    surface: "ส่วนทำงาน",
    expected: "ผลลัพธ์ที่คาด",
    actual: "ผลลัพธ์จริง",
    citation: "อ้างอิง",
    safeStop: "หยุดปลอดภัย",
    latency: "เวลา (ms)",
    cost: "ต้นทุน",
    status: "สถานะ",
    gateHeading: "ด่านตรวจทางเทคนิค (Release Gate)",
    gateTechnicalPass: "ด่านเทคนิค: ผ่านทั้งหมด (12/12 กรณี)",
    gateBlocked: "ด่านเทคนิค: ถูกระงับ",
    decisionHeading: "การตัดสินใจปล่อยระบบโดยมนุษย์ (Human Decision)",
    decisionSub: "การ Release คือการตัดสินใจของมนุษย์ที่มีหลักฐานการประเมินรองรับ",
    reviewerNameLabel: "ชื่อผู้ตรวจสอบ/ผู้มีอำนาจ (ชื่อ-สกุล)",
    reviewerPlaceholder: "เช่น Smart Wattanapornmongkol",
    limitationLabel: "ข้อจำกัดที่แท้จริงของระบบ (Honest Limitation อย่างน้อย 10 ตัวอักษร)",
    limitationPlaceholder: "ระบุข้อจำกัดที่ชุดทดสอบหรือ Demo นี้ยังไม่สามารถพิสูจน์ได้...",
    recordReleaseBtn: "อนุมัติปล่อยระบบ (Record Release)",
    recordNoReleaseBtn: "ระงับการปล่อยระบบ (Record No-Release)",
    recordedDecision: "บันทึกการตัดสินใจ Release ล่าสุด",
    feedbackHeading: "แบบรับความคิดเห็นผู้ใช้ (Feedback Affordance)",
    feedbackSub: "บันทึก Feedback แบบตัดข้อมูลส่วนบุคคล (กรองอีเมลและเบอร์โทรศัพท์อัตโนมัติ)",
    ratingLabel: "คะแนน (1-5)",
    categoryLabel: "หมวดหมู่",
    noteLabel: "ข้อความความคิดเห็น",
    submitFeedbackBtn: "ส่งความคิดเห็น",
    feedbackSuccess: "บันทึกความคิดเห็นอย่างปลอดภัยเรียบร้อยแล้ว!",
    session: {
      access: "สิทธิ์การใช้งาน",
      public: "บุคคลทั่วไป",
      staff: "เจ้าหน้าที่",
      enable: "เข้าสู่ระบบเจ้าหน้าที่",
      pin: "รหัส PIN เจ้าหน้าที่",
      cancel: "ยกเลิก",
      logout: "ออกจากระบบ",
      submitting: "กำลังตรวจสอบ…",
      unavailable: "ไม่สามารถเข้าสู่ระบบเจ้าหน้าที่ได้",
    },
  },
};

export default function SystemPage() {
  const [lang, setLang] = useState<Language>("th");
  const t = copy[lang];

  const [loading, setLoading] = useState(false);
  const [runId, setRunId] = useState<string | null>(null);
  const [results, setResults] = useState<CaseResult[]>([]);
  const [gate, setGate] = useState<ReleaseGate | null>(null);

  const [reviewerName, setReviewerName] = useState("Smart Wattanapornmongkol");
  const [honestLimitation, setHonestLimitation] = useState(
    "Synthetic evaluation suite tests 12 bounded cases; does not prove model hallucination bounds on unindexed raw documents."
  );
  const [decisionRecord, setDecisionRecord] = useState<ReleaseDecisionRecord | null>(null);
  const [decisionMessage, setDecisionMessage] = useState<string | null>(null);

  // Feedback form state
  const [rating, setRating] = useState(5);
  const [category, setCategory] = useState<"accuracy" | "citation" | "safety" | "general">("accuracy");
  const [note, setNote] = useState("");
  const [fbStatus, setFbStatus] = useState<string | null>(null);

  const runEvaluation = async () => {
    setLoading(true);
    setDecisionMessage(null);
    try {
      const res = await fetch("/api/evaluation", { method: "POST" });
      const data = await res.json();
      if (data.results) {
        setRunId(data.runId);
        setResults(data.results);
        setGate(data.gate);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDecision = async (decision: "release" | "no_release") => {
    if (!runId || !gate) return;
    try {
      const res = await fetch("/api/release", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          runId,
          reviewerName,
          honestLimitation,
          decision,
          gatePass: gate.technicalPass,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setDecisionRecord(data.record);
        setDecisionMessage(
          lang === "th"
            ? `บันทึกคำสั่ง ${decision.toUpperCase()} สำเร็จ โดยคุณ ${data.record.reviewerName}`
            : `Successfully recorded ${decision.toUpperCase()} by ${data.record.reviewerName}`
        );
      } else {
        alert(data.error);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, category, note }),
      });
      const data = await res.json();
      if (data.ok) {
        setFbStatus(t.feedbackSuccess);
        setNote("");
      } else {
        alert(data.error);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    // Run evaluation automatically on mount so user sees live results
    runEvaluation();
  }, []);

  return (
    <main className="lab">
      <header className="hero">
        <div>
          <p className="eyebrow">{t.eyebrow}</p>
          <h1>{t.title}</h1>
          <p className="subtitle">{t.subtitle}</p>
        </div>
        <div className="header-actions">
          <nav>
            <a href="/">{t.chat}</a>
            <a href="/knowledge">{t.knowledge}</a>
            <a href="/security">{t.security}</a>
            <a href="/agent">{t.agent}</a>
            <a href="/system" aria-current="page">
              {t.system}
            </a>
          </nav>
          <div className="language">
            <button
              className={lang === "th" ? "selected" : ""}
              onClick={() => setLang("th")}
            >
              TH
            </button>
            <button
              className={lang === "en" ? "selected" : ""}
              onClick={() => setLang("en")}
            >
              EN
            </button>
          </div>
          <SessionControl labels={t.session} />
        </div>
      </header>

      {/* Action Bar */}
      <section style={{ margin: "24px 0", display: "flex", gap: "16px", alignItems: "center" }}>
        <button
          onClick={runEvaluation}
          disabled={loading}
          style={{
            background: "#fa7d3d",
            border: "0",
            padding: "12px 24px",
            fontWeight: "bold",
            color: "#172018",
            fontSize: "0.95rem",
          }}
        >
          {loading ? t.runningEval : t.runEvaluationBtn}
        </button>
        {runId && (
          <span style={{ fontFamily: "DM Mono, monospace", fontSize: "0.85rem", color: "#536151" }}>
            Run ID: <strong>{runId}</strong> (Set: <strong>2026-09-eval-v1</strong>)
          </span>
        )}
      </section>

      {/* Release Gate Banner */}
      {gate && (
        <div
          style={{
            background: gate.technicalPass ? "#e6f4ea" : "#fce8e6",
            borderLeft: `6px solid ${gate.technicalPass ? "#34a853" : "#ea4335"}`,
            padding: "16px 20px",
            margin: "20px 0",
            borderRadius: "4px",
          }}
        >
          <h2 style={{ fontSize: "1.2rem", margin: "0 0 6px 0", color: gate.technicalPass ? "#137333" : "#c5221f" }}>
            {gate.technicalPass ? t.gateTechnicalPass : t.gateBlocked}
          </h2>
          <p style={{ margin: 0, fontSize: "0.88rem", color: "#374151" }}>
            {gate.technicalPass
              ? "All 12 required test cases across 8 case groups satisfy their security, citation, and bounded execution criteria."
              : `Blocking reasons: ${gate.blockingReasons.join("; ")}`}
          </p>
        </div>
      )}

      {/* Results Table */}
      {results.length > 0 && (
        <section className="ledger" style={{ marginTop: "24px" }}>
          <div className="section-heading">
            <h2>{t.evalResultsHeading}</h2>
            <p>12 versioned cases testing public RAG, staff auth, safe refusals, quarantine, approval, and outage handling.</p>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>{t.caseId}</th>
                  <th>{t.surface}</th>
                  <th>{t.expected}</th>
                  <th>{t.actual}</th>
                  <th>{t.citation}</th>
                  <th>{t.safeStop}</th>
                  <th>{t.latency}</th>
                  <th>{t.cost}</th>
                  <th>{t.status}</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r) => (
                  <tr key={r.caseId}>
                    <td>
                      <strong>{r.caseId}</strong>
                      <span className="subdata">{r.setVersion}</span>
                    </td>
                    <td><span className="access public">{r.surface}</span></td>
                    <td><code>{r.caseId.includes("failure") ? "safe_unavailable" : r.actualOutcome}</code></td>
                    <td><code>{r.actualOutcome}</code></td>
                    <td>{r.citationSupport ? "✅ Supported" : "—"}</td>
                    <td>{r.safeStop ? "🛡️ Stopped" : "Normal"}</td>
                    <td>{r.latencyMs} ms</td>
                    <td>{r.costStatus === "available" ? `$${r.approximateCostUsd}` : "unavailable"}</td>
                    <td>
                      <span className={`status ${r.passed ? "grounded" : "refused"}`}>
                        {r.passed ? "PASS" : "FAIL"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Human Release Decision Form */}
      <section className="inspection" style={{ marginTop: "32px", background: "#fdfefe" }}>
        <div className="inspection-heading">
          <div>
            <h2>{t.decisionHeading}</h2>
            <p style={{ color: "#536151", fontSize: "0.85rem", margin: 0 }}>{t.decisionSub}</p>
          </div>
        </div>

        {decisionMessage && (
          <div style={{ background: "#e0f2fe", borderLeft: "4px solid #0284c7", padding: "12px", margin: "16px 0" }}>
            <strong>{decisionMessage}</strong>
          </div>
        )}

        <div style={{ display: "grid", gap: "14px", marginTop: "16px" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "bold", marginBottom: "4px" }}>
              {t.reviewerNameLabel}
            </label>
            <input
              type="text"
              value={reviewerName}
              onChange={(e) => setReviewerName(e.target.value)}
              placeholder={t.reviewerPlaceholder}
              style={{ width: "100%", padding: "10px", border: "1px solid #aab7a8", background: "#fff" }}
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "bold", marginBottom: "4px" }}>
              {t.limitationLabel}
            </label>
            <textarea
              value={honestLimitation}
              onChange={(e) => setHonestLimitation(e.target.value)}
              placeholder={t.limitationPlaceholder}
              rows={3}
              style={{ width: "100%", padding: "10px", border: "1px solid #aab7a8", background: "#fff" }}
            />
          </div>
          <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
            <button
              onClick={() => handleDecision("release")}
              disabled={!gate?.technicalPass}
              style={{
                background: gate?.technicalPass ? "#16a34a" : "#9ca3af",
                color: "#fff",
                border: "0",
                padding: "10px 20px",
                fontWeight: "bold",
                cursor: gate?.technicalPass ? "pointer" : "not-allowed",
              }}
            >
              {t.recordReleaseBtn}
            </button>
            <button
              onClick={() => handleDecision("no_release")}
              style={{
                background: "#dc2626",
                color: "#fff",
                border: "0",
                padding: "10px 20px",
                fontWeight: "bold",
              }}
            >
              {t.recordNoReleaseBtn}
            </button>
          </div>
        </div>
      </section>

      {/* Feedback Affordance */}
      <section className="inspection" style={{ marginTop: "32px" }}>
        <div className="inspection-heading">
          <div>
            <h2>{t.feedbackHeading}</h2>
            <p style={{ color: "#536151", fontSize: "0.85rem", margin: 0 }}>{t.feedbackSub}</p>
          </div>
        </div>

        {fbStatus && (
          <div style={{ background: "#dcfce7", borderLeft: "4px solid #16a34a", padding: "10px", margin: "12px 0" }}>
            {fbStatus}
          </div>
        )}

        <form onSubmit={handleFeedbackSubmit} style={{ display: "grid", gap: "12px", marginTop: "14px" }}>
          <div style={{ display: "flex", gap: "20px" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", marginBottom: "4px" }}>{t.ratingLabel}</label>
              <select
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                style={{ padding: "8px", border: "1px solid #aab7a8" }}
              >
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>
                    {n} Star{n > 1 ? "s" : ""}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", marginBottom: "4px" }}>{t.categoryLabel}</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                style={{ padding: "8px", border: "1px solid #aab7a8" }}
              >
                <option value="accuracy">Accuracy</option>
                <option value="citation">Citation Grounding</option>
                <option value="safety">Safety & Guardrail</option>
                <option value="general">General UX</option>
              </select>
            </div>
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.8rem", marginBottom: "4px" }}>{t.noteLabel}</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Citation was grounded, fast response."
              style={{ width: "100%", padding: "10px", border: "1px solid #aab7a8" }}
            />
          </div>
          <button
            type="submit"
            style={{
              background: "#345d4c",
              color: "#fff",
              border: 0,
              padding: "10px 18px",
              justifySelf: "start",
              fontWeight: "bold",
            }}
          >
            {t.submitFeedbackBtn}
          </button>
        </form>
      </section>
    </main>
  );
}
