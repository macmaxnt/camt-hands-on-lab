import type { SafeAnswerStatus } from "./contracts";
import { clarificationMessage, noEvidenceMessage, retrieve, toCitation, type Citation, type Language, type RetrievalMode, type RetrievalResult } from "./rag";

export interface AnswerInput {
  question: string;
  mode: RetrievalMode;
  language: Language;
}

export interface LlmConfig {
  baseUrl: string;
  apiKey: string;
  model: string;
  disableThinking?: true;
}

export interface FinalAnswer {
  status: SafeAnswerStatus;
  answer: string;
  citations: Citation[];
}

export interface AnswerStreamEvent {
  event: "status" | "token" | "final" | "error";
  data: SafeAnswerStatus | string | FinalAnswer;
}

type FetchLike = typeof fetch;
const MAX_ANSWER_TOKENS = 1_024;

type BaselineStatus = Extract<SafeAnswerStatus, "grounded" | "ambiguous" | "not_found">;

export function getLlmConfig(env: Readonly<Record<string, string | undefined>> = process.env): LlmConfig {
  const baseUrl = env.OPENAI_BASE_URL?.trim().replace(/\/+$/u, "");
  const apiKey = env.OPENAI_API_KEY?.trim();
  const model = env.OPENAI_MODEL?.trim();
  if (!baseUrl || !apiKey || !model) throw new Error("Set OPENAI_BASE_URL, OPENAI_API_KEY, and OPENAI_MODEL in .env.local before asking questions.");
  const thinking = env.OPENAI_DISABLE_THINKING?.trim().toLowerCase();
  const disableThinking = thinking === "true" || (thinking !== "false" && /^nvidia\/nemotron-/iu.test(model));
  return { baseUrl, apiKey, model, ...(disableThinking ? { disableThinking: true as const } : {}) };
}

export async function* streamAnswer(
  input: AnswerInput,
  options: { config?: LlmConfig; fetchImpl?: FetchLike; retrieveImpl?: (question: string, mode: RetrievalMode) => Promise<RetrievalResult> } = {},
): AsyncGenerator<AnswerStreamEvent> {
  const question = input.question.trim();
  if (!question) throw new Error("Ask a question first.");
  // TODO(Lab 2): direct prompt-injection and synthetic-PII checks belong before this retrieval call.
  const retrieval = await (options.retrieveImpl ?? retrieve)(question, input.mode);
  if (retrieval.chunks.length === 0) {
    const answer = noEvidenceMessage(input.language);
    yield { event: "status", data: "not_found" };
    yield { event: "token", data: answer };
    yield { event: "final", data: { status: "not_found", answer, citations: [] } };
    return;
  }

  const candidates = retrieval.chunks.map((chunk, index) => toCitation(chunk, index + 1));
  const config = options.config ?? getLlmConfig();
  const response = await (options.fetchImpl ?? fetch)(`${config.baseUrl}/chat/completions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${config.apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: config.model, temperature: 0, max_tokens: MAX_ANSWER_TOKENS, stream: true,
      ...(config.disableThinking ? { chat_template_kwargs: { enable_thinking: false } } : {}),
      messages: [
        { role: "system", content: systemPrompt(input.language) },
        { role: "user", content: promptWithSources(question, retrieval.chunks.map((chunk) => chunk.text), input.language) },
      ],
    }),
  });
  if (!response.ok) throw new Error(`The language model request failed (${response.status}).`);
  if (!response.body) throw new Error("The language model did not return a response stream.");

  let prelude = "";
  let answer = "";
  let status: BaselineStatus | undefined;
  for await (const content of openAiContent(response.body)) {
    if (!status) {
      prelude += content;
      const newline = prelude.indexOf("\n");
      if (newline === -1) {
        if (prelude.length < 64 || prelude.trimStart().startsWith("STATUS:")) continue;
        status = "grounded";
        answer = prelude;
        yield { event: "status", data: status };
        yield { event: "token", data: answer };
        continue;
      }
      const parsed = parseStatus(prelude.slice(0, newline));
      if (!parsed) {
        status = "grounded";
        answer = prelude;
        yield { event: "status", data: status };
        yield { event: "token", data: answer };
        continue;
      }
      status = parsed;
      yield { event: "status", data: status };
      const remainder = prelude.slice(newline + 1).replace(/^\s+/u, "");
      if (remainder) { answer += remainder; yield { event: "token", data: remainder }; }
      continue;
    }
    answer += content;
    yield { event: "token", data: content };
  }
  if (!status) {
    const fallback = splitStatusPrelude(prelude);
    status = fallback?.status ?? "grounded";
    answer = fallback?.answer ?? prelude;
    yield { event: "status", data: status };
    if (answer) yield { event: "token", data: answer };
  }
  yield { event: "final", data: finalizeAnswer(status, answer, candidates, input.language) };
}

async function* openAiContent(stream: ReadableStream<Uint8Array>): AsyncGenerator<string> {
  const reader = stream.pipeThrough(new TextDecoderStream()).getReader();
  let pending = "";
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      pending += value;
      const lines = pending.split(/\r?\n/u);
      pending = lines.pop() ?? "";
      for (const line of lines) {
        if (!line.startsWith("data:")) continue;
        const data = line.slice(5).trim();
        if (!data || data === "[DONE]") continue;
        const payload = JSON.parse(data) as { choices?: Array<{ delta?: { content?: string } }> };
        const content = payload.choices?.[0]?.delta?.content;
        if (content) yield content;
      }
    }
  } finally { reader.releaseLock(); }
}

function parseStatus(line: string): BaselineStatus | null {
  const match = /^STATUS:\s*(grounded|ambiguous|not_found)\s*$/iu.exec(line.trim());
  return (match?.[1] as BaselineStatus | undefined) ?? null;
}

function splitStatusPrelude(value: string): { status: BaselineStatus; answer: string } | null {
  const match = /^STATUS:\s*(grounded|ambiguous|not_found)[ \t]*(?:\r?\n)?([\s\S]*)$/iu.exec(value.trim());
  return match ? { status: match[1] as BaselineStatus, answer: match[2].trimStart() } : null;
}

function finalizeAnswer(status: BaselineStatus, answer: string, candidates: Citation[], language: Language): FinalAnswer {
  const citedNumbers = new Set([...answer.matchAll(/\[(\d+)\]/gu)].map((match) => Number(match[1])));
  const citations = status === "grounded" ? candidates.filter((candidate) => citedNumbers.has(candidate.number)) : [];
  const sanitized = answer.replace(/\[(\d+)\]/gu, (marker, rawNumber) => candidates.some((candidate) => candidate.number === Number(rawNumber)) ? marker : "").trim();
  if (status === "grounded" && citations.length === 0) return { status: "not_found", answer: noEvidenceMessage(language), citations: [] };
  return { status, answer: sanitized || (status === "not_found" ? noEvidenceMessage(language) : clarificationMessage(language)), citations };
}

function systemPrompt(language: Language): string {
  const languageRule = language === "th" ? "Reply in Thai." : "Reply in English.";
  return `You are a retrieval-grounded assistant. ${languageRule}\nStart with exactly one line: STATUS: grounded, STATUS: ambiguous, or STATUS: not_found.\nUse grounded only when supplied sources directly support the answer. Cite each supported factual sentence with source numbers like [1]. Use ambiguous for one concise clarification and not_found when sources do not support an answer.`;
}

function promptWithSources(question: string, chunks: string[], language: Language): string {
  const sources = chunks.map((text, index) => `[${index + 1}]\n${text}`).join("\n\n");
  return `Question:\n${question}\n\nSources:\n${sources}\n\n${language === "th" ? "ตอบตามรูปแบบที่กำหนดเท่านั้น" : "Follow the required response format only."}`;
}
