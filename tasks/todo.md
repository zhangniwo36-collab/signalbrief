# Release checklist: SignalBrief v2

- [x] Contract tests were observed failing before implementation.
- [x] Local analyzer remains deterministic and bounded.
- [x] AI endpoint returns stable success/error envelopes and correlation IDs.
- [x] Network failure, rate limit, invalid output, missing configuration, validation, and success paths are tested.
- [x] UI never silently falls back or labels local rules as AI.
- [x] Sample numbers are disclosed as fictional source content.
- [x] No API key, source document, or model output is logged or committed.
- [x] Browser DOM and 375px mobile viewport verified without horizontal overflow.
- [x] `npm run check` passes on final source.
- [x] Code review has no unresolved required finding.
- [x] Final source is committed.
- [x] GitHub repository URL is linked from the portfolio and README.
- [ ] Exact commit is deployed through Sites.
