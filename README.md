# SignalBrief

SignalBrief is a working document-intelligence case study: paste meeting notes or a project brief and turn them into a concise summary, evidence, risks, and owned actions.

**Live portfolio:** [signalbrief-zhaan.hugs-poise-9.chatgpt.site](https://signalbrief-zhaan.hugs-poise-9.chatgpt.site)

This repository is designed for technical review. It does not claim customer adoption or invented business outcomes. Figures shown in the built-in sample are fictional source-document content.

## What is implemented

- **Real AI path:** a server-only OpenAI Responses API integration using strict JSON Schema output.
- **Honest local path:** deterministic browser rules, explicitly labeled as non-AI and useful when no API key is configured.
- **Runtime trust boundary:** model output is validated again before it reaches the UI.
- **Failure handling:** loading, retryable errors, configuration errors, upstream rate limits, timeouts, refusals, incomplete responses, and malformed output.
- **Security controls:** server-only secrets, 12k input boundary, prompt-injection instruction boundary, `store: false`, generic client errors, CSP/security headers, and a demo rate guard.
- **Operational signals:** correlation IDs, `Server-Timing`, and structured logs that never contain source documents or API keys.
- **Automated proof:** unit, contract, API, and rendered-output tests plus lint, type checking, build, and audit gates in GitHub Actions.

## Architecture

```text
Browser
  ├─ Local demo ──> deterministic analyzer ──> typed AnalysisResult
  └─ AI mode ─────> POST /api/analyze
                       ├─ request validation + bounded input
                       ├─ OpenAI Responses API + strict JSON Schema
                       ├─ runtime output validation
                       └─ request ID + duration + stable errors
```

The browser never receives the OpenAI key. AI mode sends the submitted document to OpenAI for that request; local mode keeps it in the browser. SignalBrief does not persist documents.

## API contract

`POST /api/analyze`

```json
{ "documentText": "At least 35 words, at most 12,000 characters…" }
```

A success returns `{ analysis, meta }`; an error returns a stable `{ error: { code, message, retryable, requestId } }` envelope. The implementation is in `app/lib/analysis-api.ts`, with model-output rules in `app/lib/analysis-contract.ts`.

## Run locally

Requirements: Node.js 22.13 or newer.

```bash
npm install
copy .env.example .env.local
# Add OPENAI_API_KEY to .env.local only if you want AI mode.
npm run dev
```

Without a key, the app remains fully reviewable in local demo mode and AI mode returns a transparent configuration error.

## Verify

```bash
npm run check
```

The command runs lint, TypeScript, the production build and all tests, then fails on high/critical dependency advisories. The same gate runs on every push and pull request.

## Engineering decisions

- A “confidence” percentage was intentionally removed: without a calibrated evaluation dataset it would be decorative, not evidence.
- The hosted endpoint includes a small per-instance demo rate guard. It is defense-in-depth, not a distributed production quota; a commercial release should add authenticated workspaces and an edge-level durable limiter before carrying meaningful spend.
- No document body or generated content is logged. Operational logs contain only bounded metadata: event, request ID, provider, model, status, and duration.
- The AI model is configurable with `OPENAI_MODEL`; the default is `gpt-5.4-mini` to balance structured extraction quality, latency, and cost.

See `docs/spec.md`, `docs/threat-model.md`, and `docs/operations.md` for the product contract, trust boundaries, and operational questions.

## Agent Skills process

The work was built with an explicit AI-assisted engineering workflow: specification, task breakdown, tests-first contract design, incremental implementation, security review, observability, CI, code review, and deployment. The process is documented so a reviewer can distinguish implementation evidence from generated presentation copy.
