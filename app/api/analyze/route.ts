import { handleAnalyzeRequest } from "../../lib/analysis-api";

export const runtime = "nodejs";

const rateWindows = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 5;

function consumeDemoLimit(request: Request) {
  const now = Date.now();
  const client = request.headers.get("cf-connecting-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const current = rateWindows.get(client);
  if (!current || current.resetAt <= now) {
    rateWindows.set(client, { count: 1, resetAt: now + WINDOW_MS });
    if (rateWindows.size > 1_000) {
      for (const [key, value] of rateWindows) if (value.resetAt <= now) rateWindows.delete(key);
    }
    return true;
  }
  current.count += 1;
  return current.count <= MAX_REQUESTS_PER_WINDOW;
}

function structuredLogger(level: "info" | "warn" | "error", event: Record<string, unknown>) {
  const output = JSON.stringify(event);
  if (level === "error") console.error(output);
  else if (level === "warn") console.warn(output);
  else console.info(output);
}

export async function POST(request: Request) {
  return handleAnalyzeRequest(request, {
    rateLimitAllowed: consumeDemoLimit(request),
    logger: structuredLogger,
  });
}
