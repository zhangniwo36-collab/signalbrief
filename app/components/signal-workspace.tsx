"use client";

import { useState } from "react";
import { AnalysisResults } from "./analysis-results";
import { analyzeDocument, MAX_DOCUMENT_CHARACTERS, type AnalysisResult } from "../lib/analyze-document";
import type { AnalysisMeta, AnalyzeError, AnalyzeSuccess } from "../lib/analysis-contract";

const sampleDocument = `The onboarding team agreed to launch the first concierge pilot with twelve design partners in August.

Early interviews show that manual account setup takes 46 minutes and creates repeated handoff errors. The proposed guided workflow could reduce onboarding time by 32% while keeping the existing CRM process intact.

Maya will finalize the pilot checklist by July 18 and share it with Sales Operations. Jon needs to confirm the analytics event map before Friday.

There is a risk that the vendor security review may delay access to production data by two weeks. The team will keep the pilot within the approved $8,000 budget and review results after thirty days.`;

const emptyResult = analyzeDocument("");

export function SignalWorkspace() {
  const [documentText, setDocumentText] = useState(sampleDocument);
  const [analysis, setAnalysis] = useState<AnalysisResult>(() => analyzeDocument(sampleDocument));
  const [meta, setMeta] = useState<AnalysisMeta>({ mode: "local" });
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<AnalyzeError["error"] | null>(null);
  const [actionFeedback, setActionFeedback] = useState({
    id: 0,
    message: "Sample and local brief are already loaded.",
  });

  const resultStatus = isLoading
    ? "Analyzing"
    : analysis.status === "ready"
      ? meta.mode === "ai" ? "AI result" : "Local rules demo"
      : analysis.status === "too-short" ? "Needs context" : "Waiting";

  function loadSample() {
    setDocumentText(sampleDocument);
    runLocalAnalysis(sampleDocument, "Sample reloaded and local brief refreshed.");
  }

  function clearWorkspace() {
    setDocumentText("");
    setAnalysis(emptyResult);
    setMeta({ mode: "local" });
    setApiError(null);
    announceAction("Workspace cleared. Load the sample or paste a document to continue.");
  }

  function announceAction(message: string) {
    setActionFeedback((current) => ({ id: current.id + 1, message }));
  }

  function runLocalAnalysis(text = documentText, message = "Local brief refreshed. Review the results on the right.") {
    setAnalysis(analyzeDocument(text));
    setMeta({ mode: "local" });
    setApiError(null);
    announceAction(message);
  }

  async function runAiAnalysis() {
    const localValidation = analyzeDocument(documentText);
    if (localValidation.status !== "ready") {
      setAnalysis(localValidation);
      setMeta({ mode: "local" });
      setApiError(null);
      return;
    }

    setIsLoading(true);
    setAnalysis(emptyResult);
    setApiError(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ documentText }),
      });
      const payload = await response.json() as AnalyzeSuccess | AnalyzeError;
      if (!response.ok || "error" in payload) {
        setApiError("error" in payload ? payload.error : {
          code: "UPSTREAM_ERROR",
          message: "AI analysis failed unexpectedly.",
          retryable: true,
          requestId: response.headers.get("x-request-id") ?? "unavailable",
        });
        return;
      }
      setAnalysis(payload.analysis);
      setMeta(payload.meta);
    } catch {
      setApiError({
        code: "UPSTREAM_ERROR",
        message: "The AI service could not be reached. Your document was not analyzed.",
        retryable: true,
        requestId: "unavailable",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section id="workspace" className="workspace" aria-label="SignalBrief interactive demo" aria-busy={isLoading}>
      <div className="source-panel">
        <div className="panel-heading">
          <div>
            <p className="section-label">Source / Review workspace</p>
            <h2>Working document</h2>
          </div>
          <span className="privacy-note">12k character limit</span>
        </div>

        <label className="sr-only" htmlFor="source-document">Document to analyze</label>
        <textarea
          id="source-document"
          value={documentText}
          maxLength={MAX_DOCUMENT_CHARACTERS}
          onChange={(event) => setDocumentText(event.target.value)}
          placeholder="Paste meeting notes, a project brief, or an operating update…"
          spellCheck="true"
          disabled={isLoading}
        />

        <div className="source-meta">
          <span>{documentText.length.toLocaleString()} / {MAX_DOCUMENT_CHARACTERS.toLocaleString()} chars</span>
          <span>Sample figures are fictional source data</span>
        </div>

        <div className="mode-disclosure">
          <strong>{meta.mode === "ai" ? `AI mode · ${meta.model ?? "OpenAI"}` : "Local demo mode"}</strong>
          <p>
            {meta.mode === "ai"
              ? "This result was generated server-side with OpenAI. The document was sent to the API for this request and was not stored by SignalBrief."
              : "The current result uses deterministic browser rules. Nothing leaves this browser, and it is not presented as AI."}
          </p>
        </div>

        {apiError && (
          <div className="api-error" role="alert">
            <strong>{apiError.code === "AI_NOT_CONFIGURED" ? "AI mode is not enabled here" : "AI analysis did not complete"}</strong>
            <p>{apiError.message}</p>
            <small>Request ID: {apiError.requestId}</small>
          </div>
        )}

        <p className="action-feedback" role="status" aria-live="polite" aria-atomic="true">
          <span key={actionFeedback.id}>{actionFeedback.message}</span>
        </p>

        <div className="workspace-actions">
          <div>
            <button className="text-button" type="button" onClick={loadSample} disabled={isLoading}>Load sample</button>
            <button className="text-button" type="button" onClick={clearWorkspace} disabled={isLoading}>Clear</button>
          </div>
          <div className="analysis-actions">
            <button className="secondary-button" type="button" onClick={() => runLocalAnalysis()} disabled={isLoading || !documentText.trim()}>
              Run local demo
            </button>
            <button className="primary-button" type="button" onClick={runAiAnalysis} disabled={isLoading || !documentText.trim()}>
              {isLoading ? "Analyzing…" : apiError?.retryable ? "Retry AI analysis" : "Analyze with AI"} <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>
      </div>

      <div className="result-panel">
        <div className="result-heading">
          <div>
            <p className="section-label">Output / Decision brief</p>
            <h2>Structured intelligence</h2>
          </div>
          <span className="generated-label"><span className="status-dot" />{resultStatus}</span>
        </div>
        <AnalysisResults analysis={analysis} meta={meta} isLoading={isLoading} />
      </div>
    </section>
  );
}
