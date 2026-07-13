import type { ActionItem, AnalysisResult } from "./analyze-document";

export type StructuredAnalysis = {
  summary: string;
  signals: string[];
  risks: string[];
  actions: ActionItem[];
};

export type AnalysisMeta = {
  mode: "ai" | "local";
  model?: string;
  requestId?: string;
  durationMs?: number;
};

export type AnalyzeSuccess = {
  analysis: AnalysisResult;
  meta: AnalysisMeta;
};

export type AnalyzeErrorCode =
  | "INVALID_REQUEST"
  | "DOCUMENT_TOO_SHORT"
  | "DOCUMENT_TOO_LONG"
  | "AI_NOT_CONFIGURED"
  | "RATE_LIMITED"
  | "UPSTREAM_TIMEOUT"
  | "UPSTREAM_ERROR"
  | "INVALID_MODEL_OUTPUT";

export type AnalyzeError = {
  error: {
    code: AnalyzeErrorCode;
    message: string;
    retryable: boolean;
    requestId: string;
  };
};

const isBoundedString = (value: unknown, maximum: number) =>
  typeof value === "string" && value.trim().length > 0 && value.length <= maximum;

function isStringArray(value: unknown, maximumItems: number) {
  return Array.isArray(value) && value.length <= maximumItems && value.every((item) => isBoundedString(item, 600));
}

function isActionArray(value: unknown) {
  return Array.isArray(value) && value.length <= 4 && value.every((item) => {
    if (!item || typeof item !== "object") return false;
    const action = item as Record<string, unknown>;
    return isBoundedString(action.task, 400) && isBoundedString(action.owner, 100) && isBoundedString(action.due, 100);
  });
}

export function validateStructuredAnalysis(value: unknown): StructuredAnalysis {
  if (!value || typeof value !== "object") throw new Error("Invalid structured analysis object");
  const analysis = value as Record<string, unknown>;

  if (!isBoundedString(analysis.summary, 1_200)) throw new Error("Invalid summary");
  if (!isStringArray(analysis.signals, 4)) throw new Error("Invalid signals");
  if (!isStringArray(analysis.risks, 4)) throw new Error("Invalid risks");
  if (!isActionArray(analysis.actions)) throw new Error("Invalid actions");

  return analysis as StructuredAnalysis;
}

export function extractResponseText(value: unknown): string {
  if (!value || typeof value !== "object") throw new Error("Invalid OpenAI response");
  const response = value as {
    status?: unknown;
    incomplete_details?: { reason?: unknown };
    output?: Array<{ type?: unknown; content?: Array<{ type?: unknown; text?: unknown; refusal?: unknown }> }>;
  };

  if (response.status === "incomplete") {
    throw new Error(`OpenAI response incomplete: ${String(response.incomplete_details?.reason ?? "unknown")}`);
  }

  const content = response.output
    ?.find((item) => item.type === "message")
    ?.content?.find((item) => item.type === "output_text" || item.type === "refusal");

  if (content?.type === "refusal") throw new Error("OpenAI response was refused");
  if (content?.type !== "output_text" || typeof content.text !== "string") {
    throw new Error("OpenAI response contained no output text");
  }

  return content.text;
}

export function buildReadyAnalysis(text: string, structured: StructuredAnalysis): AnalysisResult {
  const words = text.match(/[\p{L}\p{N}$%'-]+/gu) ?? [];
  const sentences = text.split(/(?<=[.!?])\s+|\n+/).map((sentence) => sentence.trim()).filter(Boolean);

  return {
    status: "ready",
    ...structured,
    metrics: {
      wordCount: words.length,
      sentenceCount: sentences.length,
      readingMinutes: Math.max(1, Math.ceil(words.length / 220)),
      itemsExtracted: structured.signals.length + structured.risks.length + structured.actions.length,
    },
  };
}

export const structuredAnalysisSchema = {
  type: "object",
  properties: {
    summary: { type: "string", description: "A concise executive summary grounded only in the source document." },
    signals: { type: "array", maxItems: 4, items: { type: "string" } },
    risks: { type: "array", maxItems: 4, items: { type: "string" } },
    actions: {
      type: "array",
      maxItems: 4,
      items: {
        type: "object",
        properties: {
          task: { type: "string" },
          owner: { type: "string" },
          due: { type: "string" },
        },
        required: ["task", "owner", "due"],
        additionalProperties: false,
      },
    },
  },
  required: ["summary", "signals", "risks", "actions"],
  additionalProperties: false,
} as const;
