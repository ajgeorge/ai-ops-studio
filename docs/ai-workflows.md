# AI Workflows

AI Ops Studio treats AI as a controlled workflow layer, not as direct business logic.

- AI calls are routed through a provider abstraction.
- Mock mode is the default local provider.
- Structured outputs are validated with Zod.
- Every AI call is planned to create an AI run record.
- Sensitive operational changes require human approval before state changes are applied.
