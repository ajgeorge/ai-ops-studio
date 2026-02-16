# ADR 001: Use a Monorepo

## Status

Accepted

## Context

AI Ops Studio includes a frontend, backend, shared schemas, database assets, and documentation. These parts evolve together during the portfolio build.

## Decision

Use an npm workspace monorepo with `apps/web`, `apps/api`, and `packages/shared`.

## Consequences

Shared contracts can be versioned with the application, and local development can run from a single root command.
