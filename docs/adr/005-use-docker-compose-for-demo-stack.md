# ADR 005: Use Docker Compose for Demo Stack

## Status

Accepted

## Context

AI Ops Studio needs a repeatable way to run the web app, API, PostgreSQL, and Redis without requiring each service to be installed manually.

## Decision

Use Docker Compose as the local demo deployment target. The API image builds the TypeScript workspaces, waits for dependent services through Compose health checks, applies the Prisma schema, seeds demo data, and starts the Express server. The web image serves the compiled Vite app with nginx.

## Consequences

Reviewers can run the project with one command while the production path remains close to the local topology. Before production use, schema changes should move from `prisma db push` to versioned Prisma migrations.
