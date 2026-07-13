const evidence = [
  {
    label: "Product boundary",
    title: "The interface never disguises a heuristic as AI.",
    copy: "AI and local analysis are separate user choices. Each result carries its execution mode and, for AI, the model and request duration.",
  },
  {
    label: "Reliability",
    title: "Model output is untrusted until it passes the contract.",
    copy: "The server requests strict Structured Outputs, then validates every summary, list, action, owner, and due date before the browser can render it.",
  },
  {
    label: "Security & privacy",
    title: "Secrets stay server-side; source text stays out of logs.",
    copy: "The API bounds input, resists embedded prompt instructions, disables response storage, applies a timeout and rate guard, and returns generic errors with correlation IDs.",
  },
  {
    label: "Verification",
    title: "The repository carries the proof, not the marketing copy.",
    copy: "Contract, API, deterministic-analysis, and rendered-output tests run with lint, type checking, build, and security audit gates on every GitHub push and pull request.",
  },
];

export function ProjectStory() {
  return (
    <section id="project-details" className="project-story" aria-labelledby="story-title">
      <div className="story-intro">
        <p className="eyebrow">Case study / Engineering evidence</p>
        <h2 id="story-title">A small product with explicit trust boundaries.</h2>
        <p>
          Delivered scope: product definition, interaction design, React implementation,
          OpenAI API integration, security review, automated tests, deployment, and documentation.
          The repository also records the Agent Skills workflow used to build it.
        </p>
      </div>

      <div className="architecture" aria-label="System architecture">
        <p className="section-label">System path</p>
        <div className="architecture-flow">
          <span>Browser input</span><b>→</b><span>Explicit mode choice</span><b>→</b>
          <span>Local rules <small>browser only</small></span><i>or</i>
          <span>POST /api/analyze <small>validation + telemetry</small></span><b>→</b>
          <span>OpenAI Responses API <small>strict JSON Schema</small></span>
        </div>
      </div>

      <div className="story-list">
        {evidence.map((item, index) => (
          <article key={item.label}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <p>{item.label}</p>
            <h3>{item.title}</h3>
            <div>{item.copy}</div>
          </article>
        ))}
      </div>

      <div className="delivery-note">
        <p className="section-label">Review the implementation</p>
        <h2>API contract · Threat model · Tests · CI quality gate · Deployment notes</h2>
        <div className="delivery-links">
          <a href="https://github.com/zhangniwo36-collab/signalbrief" target="_blank" rel="noreferrer">Review source ↗</a>
          <a href="#workspace">Try both modes again →</a>
        </div>
      </div>
    </section>
  );
}
