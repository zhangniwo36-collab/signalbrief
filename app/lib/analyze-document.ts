export type AnalysisStatus = "empty" | "too-short" | "ready";

export type ActionItem = {
  task: string;
  owner: string;
  due: string;
};

export type AnalysisResult = {
  status: AnalysisStatus;
  summary: string;
  signals: string[];
  risks: string[];
  actions: ActionItem[];
  metrics: {
    wordCount: number;
    sentenceCount: number;
    readingMinutes: number;
    itemsExtracted: number;
  };
};

export const MAX_DOCUMENT_CHARACTERS = 12_000;

const riskPattern = /\b(risk|delay|blocked|concern|issue|threat|over budget|dependency)\b/i;
const actionPattern = /\b(will|must|needs? to|action|follow up|owner|next step)\b/i;
const signalPattern = /\b(agreed|show|reduce|increase|improve|budget|target|result|metric|approved|launch|pilot)\b|\d[%$]?/i;

function emptyAnalysis(): AnalysisResult {
  return {
    status: "empty",
    summary: "",
    signals: [],
    risks: [],
    actions: [],
    metrics: {
      wordCount: 0,
      sentenceCount: 0,
      readingMinutes: 0,
      itemsExtracted: 0,
    },
  };
}

function getSentences(text: string) {
  return text
    .split(/(?<=[.!?])\s+|\n+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

function scoreSentence(sentence: string) {
  let score = Math.min(sentence.split(/\s+/).length / 10, 3);
  if (signalPattern.test(sentence)) score += 4;
  if (/\b(agreed|decision|launch)\b/i.test(sentence)) score += 4;
  if (/\d|%|\$/.test(sentence)) score += 3;
  if (actionPattern.test(sentence)) score -= 1;
  if (riskPattern.test(sentence)) score -= 2;
  return score;
}

function toAction(sentence: string): ActionItem {
  const ownerMatch = sentence.match(
    /^(?:The\s+)?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+(?:will|must|needs? to)\b/,
  );
  const dueMatch = sentence.match(
    /\b(?:by|before|due)\s+((?:[A-Z][a-z]+\s+\d{1,2})|(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday))/i,
  );
  const owner = ownerMatch?.[1] ?? "Team";
  const task = ownerMatch
    ? sentence.slice(ownerMatch[0].length).replace(/[.]$/, "").trim()
    : sentence.replace(/[.]$/, "");

  return { task, owner, due: dueMatch?.[1] ?? "Not set" };
}

export function analyzeDocument(input: string): AnalysisResult {
  const text = input.trim().slice(0, MAX_DOCUMENT_CHARACTERS);
  if (!text) return emptyAnalysis();

  const words = text.match(/[\p{L}\p{N}$%'-]+/gu) ?? [];
  const sentences = getSentences(text);
  const metrics = {
    wordCount: words.length,
    sentenceCount: sentences.length,
    readingMinutes: Math.max(1, Math.ceil(words.length / 220)),
    itemsExtracted: 0,
  };

  if (words.length < 35) {
    return {
      status: "too-short",
      summary: "Add more context so the brief can identify decisions, evidence, risks, and owners.",
      signals: [],
      risks: [],
      actions: [],
      metrics,
    };
  }

  const ranked = sentences
    .map((sentence, index) => ({ sentence, index, score: scoreSentence(sentence) }))
    .sort((a, b) => b.score - a.score || a.index - b.index);
  const summary = ranked
    .slice(0, 2)
    .sort((a, b) => a.index - b.index)
    .map(({ sentence }) => sentence)
    .join(" ");
  const risks = sentences.filter((sentence) => riskPattern.test(sentence)).slice(0, 3);
  const actions = sentences.filter((sentence) => actionPattern.test(sentence)).slice(0, 4).map(toAction);
  const signals = ranked
    .filter(({ sentence }) => signalPattern.test(sentence) && !riskPattern.test(sentence) && !actionPattern.test(sentence))
    .slice(0, 3)
    .map(({ sentence }) => sentence);

  metrics.itemsExtracted = signals.length + risks.length + actions.length;

  return { status: "ready", summary, signals, risks, actions, metrics };
}
