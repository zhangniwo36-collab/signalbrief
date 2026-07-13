import type { AnalysisResult } from "../lib/analyze-document";
import type { AnalysisMeta } from "../lib/analysis-contract";

export function AnalysisResults({ analysis, meta, isLoading = false }: { analysis: AnalysisResult; meta: AnalysisMeta; isLoading?: boolean }) {
  if (analysis.status !== "ready") {
    return (
      <div className="empty-result" role="status">
        <span className="empty-index">01 / 04</span>
        <h2>{isLoading ? "Building a schema-validated brief…" : analysis.status === "empty" ? "Your decision brief will appear here." : "A little more context will sharpen the brief."}</h2>
        <p>
          {isLoading
            ? "The server is extracting only the facts, risks, and owned actions supported by the source."
            : analysis.status === "empty"
            ? "Paste a source document or load the sample, then run the local analysis."
            : analysis.summary}
        </p>
      </div>
    );
  }

  return (
    <div className="analysis-result" aria-live="polite">
      <div className="metrics-row" aria-label="Document metrics">
        <div><span>Words</span><strong>{analysis.metrics.wordCount}</strong></div>
        <div><span>Read</span><strong>{analysis.metrics.readingMinutes} min</strong></div>
        <div><span>Sentences</span><strong>{analysis.metrics.sentenceCount}</strong></div>
        <div><span>Items extracted</span><strong>{analysis.metrics.itemsExtracted}</strong></div>
      </div>

      <p className="result-provenance">
        {meta.mode === "ai" ? `OpenAI structured output · ${meta.model ?? "configured model"}` : "Deterministic local rules · no model call"}
        {meta.durationMs ? ` · ${meta.durationMs.toLocaleString()} ms` : ""}
      </p>

      <div className="brief-grid">
        <div className="brief-primary">
          <section className="brief-section summary-section" aria-labelledby="summary-title">
            <p className="section-label">01 / Executive summary</p>
            <h2 id="summary-title">What matters now</h2>
            <p className="summary-copy">{analysis.summary}</p>
          </section>

          <section className="brief-section" aria-labelledby="signals-title">
            <p className="section-label">02 / Key signals</p>
            <h2 id="signals-title">Evidence worth carrying forward</h2>
            {analysis.signals.length ? (
              <ol className="numbered-list">
                {analysis.signals.map((signal, index) => (
                  <li key={signal}><span>{String(index + 1).padStart(2, "0")}</span><p>{signal}</p></li>
                ))}
              </ol>
            ) : <p className="muted-result">No explicit evidence surfaced in this document.</p>}
          </section>
        </div>

        <div className="brief-secondary">
          <section className="brief-section risk-section" aria-labelledby="risks-title">
            <p className="section-label">03 / Watch list</p>
            <h2 id="risks-title">Risks &amp; dependencies</h2>
            {analysis.risks.length ? (
              <ul className="risk-list">
                {analysis.risks.map((risk) => <li key={risk}><span>Risk</span><p>{risk}</p></li>)}
              </ul>
            ) : <p className="muted-result">No explicit risks were identified.</p>}
          </section>

          <section className="brief-section action-section" aria-labelledby="actions-title">
            <p className="section-label">04 / Action register</p>
            <h2 id="actions-title">Owners and next moves</h2>
            {analysis.actions.length ? (
              <ol className="action-list">
                {analysis.actions.map((action, index) => (
                  <li key={`${action.task}-${index}`}>
                    <span className="action-check" aria-hidden="true" />
                    <div><p>{action.task}</p><small>{action.owner} · {action.due}</small></div>
                  </li>
                ))}
              </ol>
            ) : <p className="muted-result">No owned actions were identified.</p>}
          </section>
        </div>
      </div>
    </div>
  );
}
