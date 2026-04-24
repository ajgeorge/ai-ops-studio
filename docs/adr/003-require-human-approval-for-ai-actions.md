# ADR 003: Require Human Approval for AI Actions

## Status

Accepted

## Context

AI Ops Studio demonstrates AI inside business workflows where recommendations may affect operational state, such as technician assignment.

## Decision

AI may generate recommendations and explanations, but sensitive changes require an explicit human approval action before state is mutated.

## Consequences

The application can show useful AI assistance while keeping deterministic business logic, approval state, and audit logs in control of operational changes.
