import assert from "node:assert/strict";
import test from "node:test";

import { analyzeDocument } from "../app/lib/analyze-document.ts";

const meetingNotes = `
The onboarding team agreed to launch the first concierge pilot with twelve design partners in August.
Early interviews show that manual account setup takes 46 minutes and creates repeated handoff errors.
The proposed guided workflow could reduce onboarding time by 32% while keeping the existing CRM process intact.
Maya will finalize the pilot checklist by July 18 and share it with Sales Operations.
Jon needs to confirm the analytics event map before Friday.
There is a risk that the vendor security review may delay access to production data by two weeks.
The team will keep the pilot within the approved $8,000 budget and review results after thirty days.
`.trim();

test("returns an explicit empty state for blank input", () => {
  const analysis = analyzeDocument("   \n  ");

  assert.equal(analysis.status, "empty");
  assert.equal(analysis.summary, "");
  assert.deepEqual(analysis.signals, []);
  assert.deepEqual(analysis.risks, []);
  assert.deepEqual(analysis.actions, []);
  assert.deepEqual(analysis.metrics, {
    wordCount: 0,
    sentenceCount: 0,
    readingMinutes: 0,
    itemsExtracted: 0,
  });
});

test("asks for more context when the input is too short", () => {
  const analysis = analyzeDocument("Launch the pilot next week.");

  assert.equal(analysis.status, "too-short");
  assert.match(analysis.summary, /more context/i);
  assert.equal(analysis.metrics.wordCount, 5);
});

test("creates a decision-ready summary from realistic meeting notes", () => {
  const analysis = analyzeDocument(meetingNotes);

  assert.equal(analysis.status, "ready");
  assert.match(analysis.summary, /launch the first concierge pilot/i);
  assert.match(analysis.summary, /reduce onboarding time by 32%/i);
  assert.equal(analysis.metrics.sentenceCount, 7);
  assert.equal(analysis.metrics.readingMinutes, 1);
  assert.equal(
    analysis.metrics.itemsExtracted,
    analysis.signals.length + analysis.risks.length + analysis.actions.length,
  );
});

test("separates key signals, explicit risks, and owned actions", () => {
  const analysis = analyzeDocument(meetingNotes);

  assert.ok(
    analysis.signals.some((signal) => /46 minutes|32%/i.test(signal)),
  );
  assert.deepEqual(analysis.risks, [
    "There is a risk that the vendor security review may delay access to production data by two weeks.",
  ]);
  assert.ok(
    analysis.actions.some(
      (action) =>
        action.owner === "Maya" &&
        action.due === "July 18" &&
        /finalize the pilot checklist/i.test(action.task),
    ),
  );
  assert.ok(
    analysis.actions.some(
      (action) => action.owner === "Jon" && action.due === "Friday",
    ),
  );
});

test("is deterministic for the same document", () => {
  assert.deepEqual(analyzeDocument(meetingNotes), analyzeDocument(meetingNotes));
});
