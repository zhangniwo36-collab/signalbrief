# Specification: SignalBrief v2

## Objective

Deliver a portfolio-grade document intelligence product that a professional engineering reviewer can verify. A visitor can choose a real server-side AI analysis or a deterministic local demo and always knows which path produced the result.

## Audience and trust promise

Primary audience: technical founders, engineering managers, and product leaders assessing product judgment and implementation reliability.

- Never present local rules as AI.
- Never fabricate customer metrics, adoption, identity, or case-study outcomes.
- Never expose secrets or log source documents.
- Every reliability claim must map to code, tests, documentation, or deployment behavior.

## Functional contract

- Accept text between 35 words and 12,000 characters.
- Produce a summary, up to four signals, up to four risks, and up to four actions with owner and due date.
- Local mode executes in the browser with deterministic rules.
- AI mode calls `POST /api/analyze`, which uses the OpenAI Responses API with strict Structured Outputs and runtime validation.
- Do not silently fall back when AI fails. Show a stable error, correlation ID, retry when appropriate, and an explicit local-demo option.
- Show execution provenance and real document metrics. Do not show an uncalibrated confidence score.

## Non-functional contract

- Keyboard-accessible controls and announced loading/error states.
- Server-only API key, `store: false`, generic errors, prompt-injection boundary, input bounds, timeout, and demo rate guard.
- Structured operational events with request ID and duration; never log document text or model output.
- Security headers on all Worker responses.
- GitHub CI runs lint, type checking, tests/build, and high-severity audit on pushes and pull requests.

## Architecture

- React 19 + TypeScript + Vinext/Vite on Cloudflare Workers.
- `app/lib/analyze-document.ts`: deterministic local analyzer.
- `app/lib/analysis-contract.ts`: shared model-output and response contract.
- `app/lib/analysis-api.ts`: testable server integration boundary.
- `app/api/analyze/route.ts`: production route, rate guard, and structured logging.
- `worker/index.ts`: application handler plus security response headers.

## Acceptance criteria

- Both modes work and are visibly distinct.
- Missing key, validation errors, rate limit, timeout, refusal/incomplete output, and malformed output are explicit.
- Unit, contract, API, rendered HTML, lint, type check, build, and audit gates pass.
- README explains setup, architecture, tradeoffs, and limitations without inflated claims.
- Exact reviewed commit is deployed and pushed to a public GitHub repository.
