# Operations notes

## Questions the signals must answer

1. Did a specific AI request complete, time out, hit an upstream limit, or fail output validation?
2. Which configured model handled it, and how long did the external boundary take?
3. Can support correlate the browser-visible error with a server event without seeing document content?

## Signals

- `x-request-id` on every API response and in every server event.
- `server-timing: openai;dur=…` on successful AI responses.
- Structured events: `openai_request_completed`, `openai_request_failed`, `openai_request_timed_out`, and `openai_response_invalid`.
- Allowlisted fields only: request ID, provider, model, upstream status, outcome, duration.

## First-response runbook

- Search logs by the request ID shown in the UI.
- For `openai_request_failed`, inspect the bounded `upstreamStatus`; confirm project limits and OpenAI service health.
- For timeouts, compare recent durations before changing the timeout or model.
- For invalid output, reproduce with a sanitized fixture and add it to contract/evaluation tests; do not inspect or copy customer source text into logs.
