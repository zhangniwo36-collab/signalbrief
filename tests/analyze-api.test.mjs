import assert from "node:assert/strict";
import test from "node:test";

import { handleAnalyzeRequest } from "../app/lib/analysis-api.ts";

const documentText = `The team approved an August pilot with twelve design partners. Interviews found that setup takes 46 minutes and causes repeated handoff errors. The proposed workflow could reduce onboarding time by 32 percent. Maya will finalize the checklist by July 18. Jon needs to confirm the analytics event map before Friday. There is a risk that the vendor security review may delay production access by two weeks.`;

const output = {
  summary: "The team approved an August pilot and must resolve the security review before production access.",
  signals: ["Setup currently takes 46 minutes."],
  risks: ["The vendor review may delay production access by two weeks."],
  actions: [
    { task: "Finalize the checklist", owner: "Maya", due: "July 18" },
    { task: "Confirm the analytics event map", owner: "Jon", due: "Friday" },
  ],
};

function request(body, contentType = "application/json") {
  return new Request("https://signalbrief.example/api/analyze", {
    method: "POST",
    headers: { "content-type": contentType },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

test("rejects unsupported media types and invalid documents", async () => {
  const unsupported = await handleAnalyzeRequest(request("text", "text/plain"), { apiKey: "test" });
  assert.equal(unsupported.status, 415);

  const tooShort = await handleAnalyzeRequest(request({ documentText: "Ship next week." }), { apiKey: "test" });
  assert.equal(tooShort.status, 422);

  const invalidJson = await handleAnalyzeRequest(request("{"), { apiKey: "test" });
  assert.equal(invalidJson.status, 400);
});

test("reports unavailable AI configuration without pretending to fall back", async () => {
  const response = await handleAnalyzeRequest(request({ documentText }), { apiKey: "" });
  const body = await response.json();

  assert.equal(response.status, 503);
  assert.equal(body.error.code, "AI_NOT_CONFIGURED");
  assert.equal(body.error.retryable, false);
});

test("returns schema-validated AI analysis with correlation metadata", async () => {
  let upstreamRequest;
  const response = await handleAnalyzeRequest(request({ documentText }), {
    apiKey: "test-key",
    model: "test-model",
    requestId: "req_test",
    fetchImpl: async (_url, init) => {
      upstreamRequest = JSON.parse(init.body);
      return new Response(JSON.stringify({
        status: "completed",
        output: [{ type: "message", content: [{ type: "output_text", text: JSON.stringify(output) }] }],
      }), { status: 200, headers: { "content-type": "application/json", "x-request-id": "openai_test" } });
    },
  });
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(response.headers.get("x-request-id"), "req_test");
  assert.equal(body.meta.mode, "ai");
  assert.equal(body.meta.model, "test-model");
  assert.equal(body.meta.requestId, "req_test");
  assert.equal(body.analysis.metrics.itemsExtracted, 4);
  assert.equal(upstreamRequest.text.format.type, "json_schema");
  assert.equal(upstreamRequest.text.format.strict, true);
  assert.equal(upstreamRequest.store, false);
});

test("maps upstream rate limits and invalid output to stable errors", async () => {
  const rateLimited = await handleAnalyzeRequest(request({ documentText }), {
    apiKey: "test",
    fetchImpl: async () => new Response("limited", { status: 429 }),
  });
  assert.equal(rateLimited.status, 429);
  assert.equal((await rateLimited.json()).error.code, "RATE_LIMITED");

  const invalidOutput = await handleAnalyzeRequest(request({ documentText }), {
    apiKey: "test",
    fetchImpl: async () => new Response(JSON.stringify({
      status: "completed",
      output: [{ type: "message", content: [{ type: "output_text", text: "{}" }] }],
    }), { status: 200 }),
  });
  assert.equal(invalidOutput.status, 502);
  assert.equal((await invalidOutput.json()).error.code, "INVALID_MODEL_OUTPUT");
});

test("distinguishes network failures from invalid model output", async () => {
  const response = await handleAnalyzeRequest(request({ documentText }), {
    apiKey: "test",
    fetchImpl: async () => { throw new TypeError("fetch failed"); },
  });

  assert.equal(response.status, 502);
  assert.equal((await response.json()).error.code, "UPSTREAM_ERROR");
});
