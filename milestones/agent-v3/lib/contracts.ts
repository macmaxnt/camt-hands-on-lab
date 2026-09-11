export type UserRole = "public" | "staff";
export type AccessLevel = "public" | "staff";

export type GuardrailDecision =
  | "allow"
  | "refuse_input"
  | "refuse_pii"
  | "no_authorized_evidence"
  | "unsafe_output";

export type SafeAnswerStatus =
  | "grounded"
  | "ambiguous"
  | "not_found"
  | "refused"
  | "unsafe_output";

export interface AuditEvent {
  id: string;
  createdAt: string;
  requestFingerprint: string;
  answerFingerprint: string | null;
  role: UserRole;
  mode: "keyword" | "semantic";
  language: "en" | "th";
  decision: GuardrailDecision;
  reasonCodes: string[];
  authorizedChunkCount: number;
  citationChunkIds: string[];
  incidentFound: boolean;
}

export type TaskState = "planned" | "awaiting_approval" | "completed" | "declined" | "safely_stopped";
export type ToolName = "search_knowledge_base" | "create_draft" | "request_approval";
export type ApprovalOutcome = "approve" | "decline";

export interface ToolCall {
  name: ToolName;
  step: number;
  evidenceIds: string[];
}

export interface EvidenceRef {
  id: string;
  documentId: string;
  documentName: string;
  accessLevel: AccessLevel;
  pageStart: number;
  pageEnd: number;
  sourceHref: string;
  citationFingerprint: string;
}

export interface Draft {
  version: number;
  body: string;
  evidenceIds: string[];
  fingerprint: string;
}

export interface ApprovalDecision {
  decision: ApprovalOutcome;
  draftVersion: number;
  decidedAt: string;
}

export interface TraceEvent {
  id: string;
  taskId: string;
  createdAt: string;
  fromState: TaskState | null;
  toState: TaskState;
  tool: ToolName | null;
  outcome: "ok" | "stopped" | "declined";
  evidenceCount: number;
  draftVersion: number | null;
  reasonCode: string | null;
  step: number;
}

export interface TaskSummary {
  taskId: string;
  createdAt: string;
  updatedAt: string;
  role: UserRole;
  state: TaskState;
  taskFingerprint: string;
  evidenceCount: number;
  draftVersion: number | null;
  approval: ApprovalDecision | null;
  reasonCodes: string[];
  stepCount: number;
}

export interface AgentWorkspace {
  summary: TaskSummary;
  plan: string[];
  evidence: EvidenceRef[];
  draft: Draft | null;
  trace: TraceEvent[];
  result: string | null;
}
