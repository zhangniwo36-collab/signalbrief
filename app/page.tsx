import { ProjectStory } from "./components/project-story";
import { SignalWorkspace } from "./components/signal-workspace";

const proofPoints = [
  ["01", "Two honest execution modes", "OpenAI on the server; deterministic rules in the browser"],
  ["02", "Strict output contract", "JSON Schema plus runtime validation before rendering"],
  ["03", "Operational evidence", "Request IDs, bounded input, timeout, rate guard, tests, and CI"],
];

export default function Home() {
  return (
    <main id="top" className="site-shell">
      <aside className="nav-rail" aria-label="Portfolio navigation">
        <a className="brand-mark" href="#top" aria-label="SignalBrief home">S<span aria-hidden="true">.</span></a>
        <nav className="rail-links" aria-label="Page sections">
          <a href="#workspace">01</a>
          <a href="#project-details">02</a>
        </nav>
        <span className="rail-label">Engineering case study</span>
      </aside>

      <div className="page-frame">
        <header className="topbar">
          <a className="wordmark" href="#top">SignalBrief</a>
          <div className="topbar-meta">
            <span className="status-label"><span className="status-dot" />Working product</span>
            <a href="https://github.com/zhangniwo36-collab/signalbrief" target="_blank" rel="noreferrer">Source code ↗</a>
            <a href="#project-details">Engineering evidence →</a>
          </div>
        </header>

        <section className="hero" aria-labelledby="page-title">
          <div>
            <p className="eyebrow">AI document intelligence · Engineering case study 01</p>
            <h1 id="page-title">Turn messy documents into clear next moves.</h1>
          </div>
          <p className="hero-intro">
            A working decision workspace with a real server-side AI path, an explicit local fallback,
            and the engineering controls needed to trust the boundary between them.
          </p>
        </section>

        <SignalWorkspace />

        <section className="proof-strip" aria-label="Project highlights">
          {proofPoints.map(([number, title, detail]) => (
            <article key={number}>
              <span>{number}</span>
              <div><h2>{title}</h2><p>{detail}</p></div>
            </article>
          ))}
        </section>

        <ProjectStory />

        <footer className="footer">
          <p>SignalBrief · AI-assisted product engineering case study</p>
          <a href="#top">Back to top →</a>
        </footer>
      </div>
    </main>
  );
}
