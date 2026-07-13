# Threat model

## Trust boundaries

1. **Visitor → browser:** text is untrusted and may be oversized or adversarial.
2. **Browser → `/api/analyze`:** request shape, media type, and length are untrusted.
3. **API → OpenAI:** API credentials are sensitive; source text is externalized only in explicit AI mode.
4. **OpenAI → UI:** generated output is untrusted until schema and runtime validation succeed.

## Threats and controls

| Threat | Implemented control | Residual risk |
|---|---|---|
| Secret exposure | Key read server-side from environment; `.env*` ignored | Deployment administrators can access configured secrets |
| Prompt injection in source | Source is delimited as untrusted data; system prompt forbids embedded instructions | Model behavior is probabilistic; output remains schema-bound and source-grounding needs evals |
| Cost/availability abuse | 12k input limit, 20s timeout, five requests/minute per instance | In-memory guard is not distributed; production needs auth and edge-level quotas |
| Invalid or hostile model output | Strict JSON Schema, runtime field/count/length validation, React escaping | Semantically incorrect but schema-valid claims require evaluation and human review |
| Privacy leakage through telemetry | Allowlisted structured metadata only; no source or output logging; `store: false` | OpenAI still processes AI-mode documents under the configured account policy |
| Clickjacking/content injection | CSP, frame denial, MIME sniffing prevention, referrer and permissions policy | CSP allows inline scripts/styles for framework compatibility |

## Release constraint

Do not position the demo as suitable for sensitive or regulated documents. Before commercial use, add authentication, durable distributed quotas, organization-specific retention policy, an evaluation dataset, and a documented deletion/export workflow.
