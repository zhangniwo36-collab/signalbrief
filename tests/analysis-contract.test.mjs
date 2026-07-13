import assert from "node:assert/strict";
import test from "node:test";

import {
  extractResponseText,
  validateStructuredAnalysis,
} from "../app/lib/analysis-contract.ts";

const structuredAnalysis = {
  summary: "The team approved an August pilot and must resolve the security review before production access.",
  signals: ["The pilot includes twelve design partners."],
  risks: ["The vendor review may delay production access by two weeks."],
  actions: [{ task: "Finalize the pilot checklist", owner: "Maya", due: "July 18" }],
};

test("accepts a bounded structured analysis payload", () => {
  assert.deepEqual(validateStructuredAnalysis(structuredAnalysis), structuredAnalysis);
});

test("rejects malformed or unbounded model output", () => {
  assert.throws(
    () => validateStructuredAnalysis({ ...structuredAnalysis, signals: Array(6).fill("signal") }),
    /signals/i,
  );
  assert.throws(
    () => validateStructuredAnalysis({ ...structuredAnalysis, actions: [{ task: "Ship", owner: "" }] }),
    /actions/i,
  );
});

test("extracts output text and rejects refusals or incomplete responses", () => {
  assert.equal(
    extractResponseText({
      status: "completed",
      output: [{ type: "message", content: [{ type: "output_text", text: JSON.stringify(structuredAnalysis) }] }],
    }),
    JSON.stringify(structuredAnalysis),
  );

  assert.throws(
    () => extractResponseText({ status: "completed", output: [{ type: "message", content: [{ type: "refusal", refusal: "No" }] }] }),
    /refused/i,
  );
  assert.throws(
    () => extractResponseText({ status: "incomplete", incomplete_details: { reason: "max_output_tokens" }, output: [] }),
    /incomplete/i,
  );
});
