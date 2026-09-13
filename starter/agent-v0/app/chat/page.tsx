"use client";

import { type FormEvent, useState, useEffect } from "react";
import type { AgentWorkspace, TaskState, UserRole } from "../../lib/contracts";
import { SessionControl } from "../session-control";

interface ThreadItem {
  id: string;
  title: string;
  status: string;
  createdAt: string;
  workspace?: AgentWorkspace;
  messages: Array<{ role: "user" | "agent"; text: string; time: string; draft?: boolean; evidence?: boolean }>;
}

export default function EvidenceConsolePage() {
  const [threads, setThreads] = useState<ThreadItem[]>([
    {
      id: "11BFCB86",
      title: "Draft a short guide for learners about using GenAI responsibly, including where to find support.",
      status: "Draft Ready",
      createdAt: "4:28 PM",
      messages: [
        {
          role: "user",
          text: "Draft a short guide for learners about using GenAI responsibly, including where to find support.",
          time: "4:28:30 PM",
        },
      ],
    },
    {
      id: "89A312DE",
      title: "Prepare a policy update Clarification: 1. Access control",
      status: "Awaiting Staff Review",
      createdAt: "4:15 PM",
      messages: [
        {
          role: "user",
          text: "Prepare a policy update on access control for the staff portal.",
          time: "4:15:10 PM",
        },
      ],
    },
    {
      id: "7F881A02",
      title: "Draft an update for staff using the current policy.",
      status: "Draft Ready",
      createdAt: "3:55 PM",
      messages: [
        {
          role: "user",
          text: "Draft an update for staff using the current policy.",
          time: "3:55:00 PM",
        },
      ],
    },
  ]);

  const [activeThreadId, setActiveThreadId] = useState<string>("11BFCB86");
  const [inputText, setInputText] = useState("");
  const [retrievalMode, setRetrievalMode] = useState<"semantic" | "keyword">("semantic");
  const [language, setLanguage] = useState<"en" | "th">("en");
  const [busy, setBusy] = useState(false);
  const [showTrace, setShowTrace] = useState(true);
  const [role, setRole] = useState<UserRole>("staff");
  const [error, setError] = useState("");

  const activeThread = threads.find((t) => t.id === activeThreadId) ?? threads[0];
  const workspace = activeThread?.workspace;

  // Run initial mock research if thread has no workspace
  useEffect(() => {
    if (activeThread && !activeThread.workspace && !busy) {
      void runAgentForThread(activeThread.title, false);
    }
  }, [activeThreadId]);

  async function runAgentForThread(prompt: string, appendUserMsg = true) {
    if (!prompt.trim() || busy) return;
    setBusy(true);
    setError("");

    if (appendUserMsg) {
      setThreads((prev) =>
        prev.map((t) =>
          t.id === activeThreadId
            ? {
                ...t,
                messages: [
                  ...t.messages,
                  { role: "user", text: prompt, time: new Date().toLocaleTimeString() },
                ],
              }
            : t
        )
      );
    }

    try {
      const response = await fetch("/api/agent/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task: prompt,
          language,
          idempotencyKey: crypto.randomUUID().replace(/-/gu, ""),
        }),
      });
      const data = (await response.json()) as AgentWorkspace & { error?: string };
      if (!response.ok) throw new Error(data.error ?? "Could not process task.");

      setThreads((prev) =>
        prev.map((t) =>
          t.id === activeThreadId
            ? {
                ...t,
                status: data.summary.state === "awaiting_approval" ? "Draft Ready" : data.summary.state,
                workspace: data,
                messages: [
                  ...t.messages,
                  {
                    role: "agent",
                    text: data.draft?.body ?? "Task processing completed with safe observation.",
                    time: new Date().toLocaleTimeString(),
                    draft: !!data.draft,
                    evidence: data.evidence.length > 0,
                  },
                ],
              }
            : t
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred.");
    } finally {
      setBusy(false);
      setInputText("");
    }
  }

  async function handleSend(e: FormEvent) {
    e.preventDefault();
    if (!inputText.trim() || busy) return;
    await runAgentForThread(inputText, true);
  }

  async function handleApproveDecision(decision: "approve" | "decline") {
    if (!workspace?.draft || busy) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/agent/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId: workspace.summary.taskId,
          draftVersion: workspace.draft.version,
          decision,
        }),
      });
      const data = (await response.json()) as AgentWorkspace & { error?: string };
      if (!response.ok) throw new Error(data.error ?? "Decision could not be saved.");

      setThreads((prev) =>
        prev.map((t) =>
          t.id === activeThreadId
            ? {
                ...t,
                status: decision === "approve" ? "Completed" : "Declined",
                workspace: data,
                messages: [
                  ...t.messages,
                  {
                    role: "agent",
                    text:
                      decision === "approve"
                        ? "✅ Approved by Staff — Ready for handoff (simulated only)."
                        : "❌ Declined by Staff.",
                    time: new Date().toLocaleTimeString(),
                  },
                ],
              }
            : t
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error saving decision.");
    } finally {
      setBusy(false);
    }
  }

  function handleNewResearch() {
    const newId = Math.random().toString(16).substring(2, 10).toUpperCase();
    const newThread: ThreadItem = {
      id: newId,
      title: "New Research Task",
      status: "Intake",
      createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      messages: [],
    };
    setThreads([newThread, ...threads]);
    setActiveThreadId(newId);
  }

  return (
    <div className="evidence-console-layout">
      {/* Top Navbar */}
      <header className="ec-navbar">
        <div className="ec-brand">
          <span className="ec-logo">AIAT × CAMT</span>
          <strong>Evidence console</strong>
        </div>
        <nav className="ec-nav">
          <a href="/">RAG chat</a>
          <a href="/agent">Task desk</a>
          <a href="/knowledge">Knowledge base</a>
          <a href="/security">Security</a>
        </nav>
        <div className="ec-top-actions">
          <button className="btn btn-mint" onClick={handleNewResearch}>
            + New research
          </button>
          <button
            className={`btn ${showTrace ? "btn-purple" : "btn-yellow"}`}
            onClick={() => setShowTrace(!showTrace)}
          >
            {showTrace ? "Hide Trace" : "Trace"}
          </button>
          <a href="/agent" className="btn btn-pink">
            Draft
          </a>
        </div>
      </header>

      {/* Main 3-Column Grid */}
      <div className="ec-main-grid">
        {/* Left Sidebar: Workspace Queue */}
        <aside className="ec-left-sidebar">
          <div className="ec-user-card">
            <div className="ec-user-info">
              <span className="ec-user-tag">{role.toUpperCase()}</span>
              <strong>{role === "staff" ? "staff-demo" : "public-user"}</strong>
            </div>
            <SessionControl
              labels={{
                access: "สิทธิ์",
                public: "Public",
                staff: "Staff",
                enable: "Login Staff",
                pin: "PIN: 1234",
                cancel: "ยกเลิก",
                logout: "Sign out",
                submitting: "...",
                unavailable: "N/A",
              }}
              onRoleChange={setRole}
            />
          </div>

          <div className="ec-queue-header">
            <span className="eyebrow">RESEARCH THREADS</span>
            <h2>Workspace queue</h2>
          </div>

          <div className="ec-thread-list">
            {threads.map((t) => (
              <div
                key={t.id}
                className={`ec-thread-card ${t.id === activeThreadId ? "active" : ""}`}
                onClick={() => setActiveThreadId(t.id)}
              >
                <div className="ec-thread-top">
                  <span className="ec-bullet">•</span>
                  <strong className="ec-thread-title">{t.title}</strong>
                </div>
                <span className={`ec-thread-status status-${t.status.toLowerCase().replace(/\s+/gu, "-")}`}>
                  {t.status}
                </span>
              </div>
            ))}
          </div>
        </aside>

        {/* Center: Active Chat & Workspace */}
        <main className="ec-center-chat">
          {/* Thread Header */}
          <div className="ec-chat-header">
            <div className="ec-thread-meta">
              <span>THREAD {activeThread?.id}</span>
              <span className="ec-state-pill">
                {activeThread?.status.toUpperCase() || "INTAKE"}
              </span>
            </div>
            <h1 className="ec-task-title">{activeThread?.title}</h1>
            <div className="ec-loop-bar">
              <span className="ec-loop-tag">OBSERVE → ACT LOOP</span>
              <span>
                {busy
                  ? "Choosing and running the next authorized tool..."
                  : "Waiting for next step or human decision..."}
              </span>
              <button className="ec-inspect-btn" onClick={() => setShowTrace(true)}>
                Inspect trace
              </button>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="ec-message-stream">
            {activeThread?.messages.map((msg, idx) => (
              <div key={idx} className={`ec-bubble-row ${msg.role}`}>
                <div className="ec-bubble">
                  <div className="ec-bubble-sender">
                    <strong>{msg.role === "user" ? "YOU" : "AGENT (BOUNDED)"}</strong>
                    <small>{msg.time}</small>
                  </div>
                  <p className="ec-bubble-text">{msg.text}</p>

                  {/* Evidence Card within message */}
                  {msg.evidence && workspace?.evidence && workspace.evidence.length > 0 ? (
                    <div className="ec-inline-evidence">
                      <strong>📚 Approved Evidence ({workspace.evidence.length}):</strong>
                      {workspace.evidence.map((ev, eIdx) => (
                        <a
                          key={eIdx}
                          href={ev.sourceHref}
                          target="_blank"
                          rel="noreferrer"
                          className="ec-ev-link"
                        >
                          [{eIdx + 1}] {ev.documentName} (Page {ev.pageStart}) · {ev.accessLevel}
                        </a>
                      ))}
                    </div>
                  ) : null}

                  {/* Draft Review Panel */}
                  {msg.draft && workspace?.summary.state === "awaiting_approval" ? (
                    <div className="ec-inline-approval">
                      <p>⚠️ This draft is waiting for an authenticated staff decision.</p>
                      <div className="ec-appr-btns">
                        <button
                          className="btn btn-mint"
                          onClick={() => void handleApproveDecision("approve")}
                          disabled={busy || role !== "staff"}
                        >
                          👍 Approve Draft
                        </button>
                        <button
                          className="btn btn-pink"
                          onClick={() => void handleApproveDecision("decline")}
                          disabled={busy || role !== "staff"}
                        >
                          ❌ Decline Draft
                        </button>
                      </div>
                      {role !== "staff" && (
                        <small className="ec-staff-hint">
                          * Login as Staff (PIN: 1234) on the left sidebar to enable approval.
                        </small>
                      )}
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
            {busy && (
              <div className="ec-bubble-row agent">
                <div className="ec-bubble ec-typing">
                  <span>⚡ Agent is running bounded tool...</span>
                </div>
              </div>
            )}
            {error && <div className="error-message">{error}</div>}
          </div>

          {/* Bottom Chat Input */}
          <form className="ec-input-form" onSubmit={handleSend}>
            <textarea
              className="ec-textarea"
              rows={2}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Continue this task with an instruction or clarification..."
              disabled={busy}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void handleSend(e);
                }
              }}
            />
            <div className="ec-input-controls">
              <div className="ec-dropdowns">
                <label>
                  RETRIEVAL
                  <select
                    value={retrievalMode}
                    onChange={(e) => setRetrievalMode(e.target.value as "semantic" | "keyword")}
                  >
                    <option value="semantic">Semantic</option>
                    <option value="keyword">Keyword / FTS5</option>
                  </select>
                </label>
                <label>
                  LANGUAGE
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as "en" | "th")}
                  >
                    <option value="en">English</option>
                    <option value="th">ไทย</option>
                  </select>
                </label>
              </div>
              <button className="btn btn-yellow" type="submit" disabled={busy || !inputText.trim()}>
                {busy ? "Working..." : "Send Task 🚀"}
              </button>
            </div>
          </form>
        </main>

        {/* Right Sidebar: Safe Execution Trace */}
        {showTrace && (
          <aside className="ec-right-sidebar">
            <div className="ec-trace-header">
              <div>
                <span className="eyebrow">SAFE EXECUTION TRACE</span>
                <h2>Tool activity</h2>
              </div>
              <button className="ec-close-btn" onClick={() => setShowTrace(false)}>
                ✕
              </button>
            </div>
            <p className="ec-trace-desc">
              Each action follows a safe observation from the prior tool. Tool inputs, provider
              reasoning, and raw outputs are never retained here.
            </p>

            <div className="ec-trace-timeline">
              {workspace?.trace && workspace.trace.length > 0 ? (
                workspace.trace.map((tr) => (
                  <div key={tr.id} className="ec-trace-card">
                    <div className="ec-trace-tag-row">
                      <span className={`ec-trace-tag tag-${tr.outcome}`}>
                        {tr.outcome.toUpperCase()}
                      </span>
                      <small>{new Date(tr.createdAt).toLocaleTimeString()}</small>
                    </div>
                    <strong>{tr.tool ? tr.tool.replace(/_/gu, " ") : "State transition"}</strong>
                    <span>
                      Step {tr.step} · {tr.evidenceCount} evidence · {tr.reasonCode || "ok"}
                    </span>
                  </div>
                ))
              ) : (
                <>
                  <div className="ec-trace-card">
                    <div className="ec-trace-tag-row">
                      <span className="ec-trace-tag tag-ok">STARTED</span>
                      <small>4:28:35 PM</small>
                    </div>
                    <strong>Create cited draft</strong>
                    <span>8 evidence · draft v1</span>
                  </div>
                  <div className="ec-trace-card">
                    <div className="ec-trace-tag-row">
                      <span className="ec-trace-tag tag-ok">COMPLETED</span>
                      <small>4:28:34 PM</small>
                    </div>
                    <strong>Search authorized documents</strong>
                    <span>8 evidence found</span>
                  </div>
                  <div className="ec-trace-card">
                    <div className="ec-trace-tag-row">
                      <span className="ec-trace-tag tag-ok">STARTED</span>
                      <small>4:28:34 PM</small>
                    </div>
                    <strong>Search authorized documents</strong>
                    <span>role: staff</span>
                  </div>
                </>
              )}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
