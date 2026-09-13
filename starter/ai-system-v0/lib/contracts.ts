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

export type EvaluationSurface = "answer" | "agent";

export type ExpectedOutcome =
  | "grounded"
  | "ambiguous"
  | "not_found"
  | "refused"
  | "safely_stopped"
  | "awaiting_approval"
  | "provider_unavailable";

export type ErrorCategory =
  | "none"
  | "unsafe_input"
  | "no_evidence"
  | "poisoned_source"
  | "malformed_output"
  | "rate_limited"
  | "provider_outage";

export interface EvaluationCase {
  caseId: string;
  setVersion: string;
  surface: EvaluationSurface;
  roleCategory: UserRole;
  requestId: string;
  evidenceIds: string[];
  expectedOutcome: ExpectedOutcome;
  expectedCitationSupport: boolean;
  expectedSafeStop: boolean;
  expectedAccessResult: boolean;
  releaseBlocking: boolean;
}

export interface CaseResult {
  caseId: string;
  setVersion: string;
  surface: EvaluationSurface;
  passed: boolean;
  actualOutcome: ExpectedOutcome;
  citationSupport: boolean;
  safeStop: boolean;
  accessResult: boolean;
  citationFingerprints: string[];
  latencyMs: number;
  errorCategory: ErrorCategory;
  retryCount: number;
  tokenStatus: "available" | "unavailable";
  inputTokens: number | null;
  outputTokens: number | null;
  costStatus: "available" | "unavailable";
  approximateCostUsd: number | null;
  releaseImpact: "blocking" | "informational";
  blockingFindings: string[];
}

export interface ReleaseGate {
  requiredCases: number;
  passedCases: number;
  technicalPass: boolean;
  blockingReasons: string[];
  humanReviewer: string | null;
  decision: "release" | "no_release" | "pending";
  limitation: string;
  evaluatedAt: string;
}

export interface ReleaseDecisionRecord {
  id: string;
  runId: string;
  decision: "release" | "no_release";
  reviewerName: string;
  honestLimitation: string;
  createdAt: string;
}

export interface FeedbackPayload {
  rating: number;
  category: "accuracy" | "citation" | "safety" | "general";
  note?: string;
  traceId?: string;
}

export interface FeedbackRecord {
  id: string;
  createdAt: string;
  rating: number;
  category: string;
  sanitizedNote: string;
  traceFingerprint: string | null;
}
