# Quality review: SignalBrief v2

## Scope

Review of the dual-mode document analysis product, OpenAI boundary, UI states, security controls, telemetry, CI, documentation, and dependency upgrades.

## Findings resolved

1. **Required — misleading confidence metric:** removed the uncalibrated percentage and replaced it with directly countable extracted items.
2. **Required — ambiguous execution mode:** split AI and local analysis into explicit choices with result provenance. AI failures never silently fall back.
3. **Required — network errors misclassified as invalid output:** separated network, timeout, upstream HTTP, and output-validation failure stages; added regression coverage.
4. **Required — unvalidated model output:** added strict OpenAI JSON Schema and independent runtime bounds before UI rendering.
5. **Required — secret/cost boundary:** server-only key, bounded input, no-store request, timeout, per-instance demo guard, generic errors, and no source/output logging.
6. **Recommended — missing operational evidence:** added correlation IDs, `Server-Timing`, structured events, and a short request-ID runbook.
7. **Recommended — vulnerable development chain:** upgraded Next, Vite, Cloudflare plugin, Wrangler, Workers types, Babel, and YAML transitive dependencies. High advisories reduced from six to zero.

## Residual risks accepted

- `npm audit` reports two moderate PostCSS advisories inside Next. The automated remediation proposes a breaking downgrade to Next 9.3.3. SignalBrief does not accept or generate user-controlled CSS, so the vulnerable stringify path is not exposed; retain the current patched Next 16 release and monitor upstream.
- The in-memory rate guard is instance-local and explicitly documented as demo defense-in-depth. Public paid usage requires authentication and an edge-level durable quota.
- This implementation validates structure, not factual correctness. A commercial release requires a representative evaluation dataset and human review rules for consequential documents.
- The current execution environment refused outbound connections to `api.openai.com`, so live model success could not be confirmed here. The exact success, refusal/incomplete, rate-limit, invalid-output, network, and configuration paths are covered with contract-level HTTP fixtures.

## Verification evidence

- `npm run check`: passed lint, strict TypeScript, production build, 15 tests, and high-severity audit gate.
- Real browser: semantic DOM and accessible names inspected; explicit missing-key error and Request ID observed.
- Mobile browser: 375px effective viewport, no horizontal overflow, both analysis actions 310px wide.
- Dependency tree reproduced with `npm ci` against the official npm registry.
- Secret scan found no assigned `OPENAI_API_KEY` value in tracked source.

## Verdict

Approved for portfolio release. No unresolved critical or required application-code findings remain. GitHub repository creation/access and optional production secret configuration are external release steps, not code-quality exceptions.
