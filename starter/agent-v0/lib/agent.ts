import { randomUUID } from "node:crypto";
import type { AgentWorkspace, ApprovalDecision, ApprovalOutcome, Draft, EvidenceRef, TaskState, TaskSummary, ToolCall, ToolName, TraceEvent, UserRole } from "./contracts";
import type { RetrievedChunk } from "./corpus/types";
import { getSeedCorpusService } from "./corpus/service";
import { inspectQuestion, inspectRetrievedChunk, isPiiReason } from "./guardrails";
import { citationFingerprint, fingerprint, securitySecret } from "./security";

export const AGENT_TOOLS = ["search_knowledge_base", "create_draft", "request_approval"] as const;
export const MAX_AGENT_STEPS = 3;
const MAX_EVIDENCE = 3;
const MAX_TASK_CHARACTERS = 1_500;
const MAX_DRAFT_CHARACTERS = 2_400;

type Language = "en" | "th";

export interface AgentRunRequest {
  task: string;
  language: Language;
  idempotencyKey: string;
}

export interface AgentRunInput extends AgentRunRequest {
  role: UserRole;
}

export interface AgentApproveRequest {
  taskId: string;
  draftVersion: number;
  decision: ApprovalOutcome;
}

export interface AgentService {
  searchKeyword(question: string, limit: number, role: UserRole): RetrievedChunk[];
  quarantineChunk(input: { chunkId: number; reasonCode: string; detectorVersion: string; contentFingerprint: string }): boolean;
  recordAgentTask(summary: TaskSummary): void;
  recordAgentTrace(event: TraceEvent): void;
}

interface ActiveTask {
  task: string;
  workspace: AgentWorkspace;
  approvalUsed: boolean;
}

export class AgentRequestError extends Error {
  constructor(message: string, readonly status = 400) { super(message); }
}

export function parseAgentRunRequest(value: unknown): AgentRunRequest {
  const body = exactRecord(value, ["task", "language", "idempotencyKey"]);
  const task = typeof body.task === "string" ? body.task.trim() : "";
  if (!task) throw new AgentRequestError("Enter a task first.");
  if (task.length > MAX_TASK_CHARACTERS) throw new AgentRequestError(`Tasks must be ${MAX_TASK_CHARACTERS.toLocaleString("en-US")} characters or fewer.`);
  if (body.language !== "en" && body.language !== "th") throw new AgentRequestError("Choose a supported language.");
  const idempotencyKey = typeof body.idempotencyKey === "string" ? body.idempotencyKey.trim() : "";
  if (!/^[A-Za-z0-9_-]{8,128}$/u.test(idempotencyKey)) throw new AgentRequestError("Use a valid idempotency key.");
  return { task, language: body.language, idempotencyKey };
}

export function parseAgentApproveRequest(value: unknown): AgentApproveRequest {
  const body = exactRecord(value, ["taskId", "draftVersion", "decision"]);
  const taskId = typeof body.taskId === "string" ? body.taskId.trim() : "";
  if (!/^[A-Za-z0-9-]{8,128}$/u.test(taskId)) throw new AgentRequestError("Use a valid task ID.");
  if (!Number.isSafeInteger(body.draftVersion) || (body.draftVersion as number) < 1) throw new AgentRequestError("Use a valid draft version.");
  if (body.decision !== "approve" && body.decision !== "decline") throw new AgentRequestError("Choose approve or decline.");
  return { taskId, draftVersion: body.draftVersion as number, decision: body.decision };
}

/** The coordinator creates these calls. Browser payloads never include a tool call. */
export function validateToolCall(value: unknown, allowedEvidenceIds: readonly string[]): ToolCall {
  const body = exactRecord(value, ["name", "step", "evidenceIds"]);
  if (!AGENT_TOOLS.includes(body.name as ToolName)) throw new AgentRequestError("The requested tool is not allowed.");
  if (!Number.isSafeInteger(body.step) || (body.step as number) < 1) throw new AgentRequestError("Use a valid tool step.");
  if (!Array.isArray(body.evidenceIds) || body.evidenceIds.length > MAX_EVIDENCE || !body.evidenceIds.every((id) => typeof id === "string" && allowedEvidenceIds.includes(id))) {
    throw new AgentRequestError("The tool requested invalid evidence.");
  }
  return { name: body.name as ToolName, step: body.step as number, evidenceIds: [...body.evidenceIds] as string[] };
}

export class AgentCoordinator {
  private readonly active = new Map<string, ActiveTask>();
  private readonly idempotentRuns = new Map<string, string>();
  private readonly service: AgentService;
  private readonly secret: string;
  private readonly maxSteps: number;

  constructor(options: { service?: AgentService; secret?: string; maxSteps?: number } = {}) {
    this.service = options.service ?? getSeedCorpusService();
    this.secret = options.secret ?? securitySecret();
    this.maxSteps = options.maxSteps ?? MAX_AGENT_STEPS;
  }

  run(input: AgentRunInput): AgentWorkspace {
    const runKey = `${input.role}\0${input.idempotencyKey}`;
    const existingId = this.idempotentRuns.get(runKey);
    if (existingId) {
      const existing = this.active.get(existingId);
      if (existing) return copyWorkspace(existing.workspace);
    }

    const active = this.createTask(input);
    this.active.set(active.workspace.summary.taskId, active);
    this.idempotentRuns.set(runKey, active.workspace.summary.taskId);
    const inputMatch = inspectQuestion(input.task);
    if (inputMatch) return this.stop(active, isPiiReason(inputMatch.reason) ? "unsafe_pii_intake" : "unsafe_intake");
    if (isAmbiguousTask(input.task)) {
      active.workspace.plan = ["Clarify the audience, source, and required outcome before searching."];
      this.trace(active, null, "ok", "clarification_required");
      return this.persist(active);
    }
    if (input.role === "public" && requestsProtectedMaterial(input.task)) return this.stop(active, "no_authorized_evidence");

    const search = this.tryTool(active, "search_knowledge_base", []);
    if (!search) return copyWorkspace(active.workspace);
    const evidence = this.authorizedEvidence(input.task, input.role);
    active.workspace.evidence = evidence;
    if (evidence.length === 0) return this.stop(active, "no_authorized_evidence");
    this.trace(active, search.name, "ok", null);

    const draftCall = this.tryTool(active, "create_draft", evidence.map((item) => item.id));
    if (!draftCall) return copyWorkspace(active.workspace);
    active.workspace.draft = createDraft(input.task, evidence, this.secret);
    this.trace(active, draftCall.name, "ok", null);

    const approvalCall = this.tryTool(active, "request_approval", evidence.map((item) => item.id));
    if (!approvalCall) return copyWorkspace(active.workspace);
    this.transition(active, "awaiting_approval");
    active.workspace.plan = ["Authorized search completed.", "Constrained draft created from the displayed evidence.", "Awaiting an authenticated staff decision for draft version 1."];
    this.trace(active, approvalCall.name, "ok", null);
    return this.persist(active);
  }

  approve(input: AgentApproveRequest, role: UserRole): AgentWorkspace {
    if (role !== "staff") throw new AgentRequestError("Staff approval is required.", 403);
    const active = this.active.get(input.taskId);
    if (!active) throw new AgentRequestError("This task is not available for approval.", 404);
    const draft = active.workspace.draft;
    if (active.approvalUsed || active.workspace.summary.approval) throw new AgentRequestError("This draft already has a decision.", 409);
    if (active.workspace.summary.state !== "awaiting_approval" || !draft) throw new AgentRequestError("This task is not awaiting approval.", 409);
    if (input.draftVersion !== draft.version) throw new AgentRequestError("This draft version is stale.", 409);

    const approval: ApprovalDecision = { decision: input.decision, draftVersion: draft.version, decidedAt: new Date().toISOString() };
    active.approvalUsed = true;
    active.workspace.summary.approval = approval;
    if (input.decision === "approve") {
      this.transition(active, "completed");
      active.workspace.result = "Ready for human handoff — simulated only. No external action was performed.";
      this.trace(active, null, "ok", "approved_local_simulation");
    } else {
      this.transition(active, "declined");
      active.workspace.result = "The draft was declined. No external action was performed.";
      this.trace(active, null, "declined", "human_declined");
    }
    return this.persist(active);
  }

  private createTask(input: AgentRunInput): ActiveTask {
    const now = new Date().toISOString();
    const taskId = randomUUID();
    const summary: TaskSummary = {
      taskId, createdAt: now, updatedAt: now, role: input.role, state: "planned",
      taskFingerprint: fingerprint(this.secret, "request", input.task), evidenceCount: 0, draftVersion: null,
      approval: null, reasonCodes: [], stepCount: 0,
    };
    return {
      task: input.task,
      approvalUsed: false,
      workspace: { summary, plan: ["Validate the task before any tool use."], evidence: [], draft: null, trace: [], result: null },
    };
  }

  private authorizedEvidence(task: string, role: UserRole): EvidenceRef[] {
    const evidence: EvidenceRef[] = [];
    for (const chunk of this.service.searchKeyword(task, MAX_EVIDENCE, role)) {
      if (chunk.accessLevel === "staff" && role !== "staff") continue;
      const match = inspectRetrievedChunk(chunk.text);
      if (match) {
        this.service.quarantineChunk({ chunkId: chunk.id, reasonCode: match.reason, detectorVersion: match.detectorVersion, contentFingerprint: fingerprint(this.secret, "chunk", chunk.text) });
        continue;
      }
      evidence.push({
        id: `evidence-${chunk.id}`,
        documentId: chunk.documentId,
        documentName: chunk.documentName,
        accessLevel: chunk.accessLevel,
        pageStart: chunk.pageStart,
        pageEnd: chunk.pageEnd,
        sourceHref: `/api/knowledge/documents/${encodeURIComponent(chunk.documentId)}/file#page=${chunk.pageStart}`,
        citationFingerprint: citationFingerprint(this.secret, { chunkId: chunk.id, documentId: chunk.documentId, pageStart: chunk.pageStart, pageEnd: chunk.pageEnd, text: chunk.text }),
      });
    }
    return evidence;
  }

  private tryTool(active: ActiveTask, name: ToolName, evidenceIds: string[]): ToolCall | null {
    if (active.workspace.summary.stepCount >= this.maxSteps) {
      this.stop(active, "max_steps_reached");
      return null;
    }
    const call = validateToolCall({ name, step: active.workspace.summary.stepCount + 1, evidenceIds }, active.workspace.evidence.map((item) => item.id));
    active.workspace.summary.stepCount = call.step;
    return call;
  }

  private transition(active: ActiveTask, state: TaskState) {
    active.workspace.summary.state = state;
    active.workspace.summary.updatedAt = new Date().toISOString();
  }

  private stop(active: ActiveTask, reasonCode: string): AgentWorkspace {
    this.transition(active, "safely_stopped");
    active.workspace.plan = ["The workflow stopped safely. Start a new, more specific task if needed."];
    active.workspace.summary.reasonCodes = unique([...active.workspace.summary.reasonCodes, reasonCode]);
    this.trace(active, null, "stopped", reasonCode);
    return this.persist(active);
  }

  private trace(active: ActiveTask, tool: ToolName | null, outcome: TraceEvent["outcome"], reasonCode: string | null) {
    const summary = active.workspace.summary;
    const previous = active.workspace.trace.at(-1)?.toState ?? null;
    const event: TraceEvent = {
      id: randomUUID(), taskId: summary.taskId, createdAt: new Date().toISOString(), fromState: previous,
      toState: summary.state, tool, outcome, evidenceCount: active.workspace.evidence.length,
      draftVersion: active.workspace.draft?.version ?? null, reasonCode, step: summary.stepCount,
    };
    if (reasonCode) summary.reasonCodes = unique([...summary.reasonCodes, reasonCode]);
    active.workspace.trace.push(event);
    this.service.recordAgentTrace(event);
  }

  private persist(active: ActiveTask): AgentWorkspace {
    const { summary, evidence, draft } = active.workspace;
    summary.evidenceCount = evidence.length;
    summary.draftVersion = draft?.version ?? null;
    summary.updatedAt = new Date().toISOString();
    this.service.recordAgentTask(summary);
    return copyWorkspace(active.workspace);
  }
}

let coordinator: AgentCoordinator | undefined;
export function getAgentCoordinator(): AgentCoordinator {
  coordinator ??= new AgentCoordinator();
  return coordinator;
}

function createDraft(task: string, evidence: EvidenceRef[], secret: string): Draft {
  const evidenceIds = evidence.map((item) => item.id);
  const references = evidence.map((item, index) => `[${index + 1}] ${item.documentName}, page ${item.pageStart}${item.pageEnd === item.pageStart ? "" : `–${item.pageEnd}`}`).join("\n");
  const body = `Draft for review\n\n${task}\n\nThis draft uses only the authorized evidence listed below. It needs staff approval before the local simulated handoff.\n\n${references}`;
  if (body.length > MAX_DRAFT_CHARACTERS) throw new AgentRequestError("The constrained draft exceeded its size limit.");
  return { version: 1, body, evidenceIds, fingerprint: fingerprint(secret, "answer", body) };
}

function isAmbiguousTask(task: string): boolean {
  const normalized = task.toLowerCase().replace(/\s+/gu, " ").trim();
  return /^(?:prepare|draft|write) (?:an? )?(?:update|briefing|note) (?:about|on) (?:the )?policy\.?$/u.test(normalized);
}

function requestsProtectedMaterial(task: string): boolean {
  return /\b(?:staff[-\s]?only|staff procedure|internal procedure|protected memo)\b/iu.test(task);
}

function exactRecord(value: unknown, keys: string[]): Record<string, unknown> {
  if (!isRecord(value)) throw new AgentRequestError("Use a JSON object.");
  const actual = Object.keys(value);
  if (actual.length !== keys.length || actual.some((key) => !keys.includes(key))) throw new AgentRequestError("The request contains an unknown or missing field.");
  return value;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function unique(values: string[]): string[] { return [...new Set(values)].sort(); }
function copyWorkspace(workspace: AgentWorkspace): AgentWorkspace { return JSON.parse(JSON.stringify(workspace)) as AgentWorkspace; }
