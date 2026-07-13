# Implementation plan: SignalBrief v2

## Goal

Upgrade the existing portfolio demo into a verifiable engineering case study and publish the exact reviewed source to GitHub and Sites.

## Dependency graph

`trust contract` → `failing tests` → `AI server boundary` → `explicit dual-mode UI` → `security + telemetry` → `CI + documentation` → `review` → `GitHub + Sites`

## Workstream

- [x] Replace uncalibrated confidence with a directly countable metric.
- [x] Specify and test model-output and HTTP error contracts.
- [x] Integrate OpenAI Responses API with strict Structured Outputs and runtime validation.
- [x] Add explicit local/AI modes, provenance, loading, errors, retry, and request IDs.
- [x] Add input bounds, prompt-injection boundary, timeout, rate guard, no-store behavior, and response security headers.
- [x] Add structured operational events and an incident lookup path.
- [x] Add GitHub quality gate, dependency updates, README, specification, threat model, and operations notes.
- [x] Verify desktop DOM, interaction behavior, mobile layout, and horizontal overflow in a real browser.
- [x] Complete final code review and quality gate.
- [ ] Upload the exact source to the public GitHub repository.
- [ ] Save and deploy the exact commit through Sites.

## Known external dependencies

- GitHub connector must expose a writable repository; it cannot create a new repository in the current capability set.
- A production OpenAI secret must be configured explicitly in Sites if hosted AI mode should be active. The key is never copied from local state without user authorization.
