# AI Workflows

AI Ops Studio treats AI as a controlled workflow layer, not as direct business logic.

- AI calls are routed through a provider abstraction.
- Mock mode is the default local provider.
- Structured outputs are validated with Zod.
- Every AI call is planned to create an AI run record.
- Sensitive operational changes require human approval before state changes are applied.

## Provider Abstraction

The API uses an `AIProvider` interface with two operations:

- `generateText`
- `generateStructured`

`MockAIProvider` is the default provider for local development and tests. It returns deterministic, realistic payloads for:

- `requirements.analyzeBrief`
- `operations.explainRecommendation`
- `rag.answerWithContext`

`POST /api/ai/demo-runs` exercises the provider, active prompt lookup, structured validation, and AI run lifecycle logging. If the database is unavailable, the endpoint falls back to built-in prompt defaults and still returns mock output; when the database is available, run records are persisted in `AIRun`.

The OpenAI-compatible provider is intentionally stubbed until the real-provider integration slice. This keeps the current app cloneable without API keys.
