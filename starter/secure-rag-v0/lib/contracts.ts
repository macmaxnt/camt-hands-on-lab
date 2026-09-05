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
  role: UserRole;
  decision: GuardrailDecision;
  reasonCodes: string[];
  authorizedChunkCount: number;
  citationChunkIds: string[];
}
