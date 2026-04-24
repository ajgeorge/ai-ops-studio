# ADR 004: Store AI Run History

## Status

Accepted

## Context

AI-assisted workflows need traceability for prompts, inputs, outputs, validation status, latency, and failures.

## Decision

Every AI workflow is routed through the provider/orchestration layer and recorded in `AIRun` when the database is available.

## Consequences

The AI Control Center can show run history, prompt versions, errors, latency, and model/provider behavior without relying on provider dashboards.
