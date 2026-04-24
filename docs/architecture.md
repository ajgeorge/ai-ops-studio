# Architecture

AI Ops Studio is a full-stack TypeScript monorepo with a React dashboard, Express API, shared Zod schemas, and a Prisma/PostgreSQL persistence layer.

```txt
User
  |
React + Vite dashboard
  |
RTK Query API client
  |
Express API
  |
Feature services
  |-- Requirements Engine
  |-- Operations Copilot
  |-- RAG Evaluation Lab
  |-- AI Control Center
  |-- Audit Logs
  |
Prisma Client
  |
PostgreSQL
```

## Application Boundaries

- `apps/web` owns routes, screens, dashboard composition, and user interaction state.
- `apps/api` owns HTTP routes, workflow orchestration, persistence, audit logging, and AI provider calls.
- `packages/shared` owns cross-app schemas, request/response types, enums, and constants.
- `prisma` owns database models, generated client configuration, and seed data.

## Runtime Flow

1. The web app calls typed RTK Query endpoints under `/api`.
2. Express validates inputs with shared Zod schemas before invoking feature services.
3. Services persist workflow state through Prisma and record audit events.
4. AI-assisted actions call the provider abstraction, validate structured output, and write `AIRun` records.
5. Approval-sensitive operations, such as technician assignment, are staged until a human approves or rejects the recommendation.

## Infrastructure

The Docker Compose stack runs:

- `postgres` for application state
- `redis` for future background queue support
- `api` for the Express service
- `web` for the compiled Vite app served by nginx

The GitHub Actions workflow verifies install, typecheck, API tests, build, and production dependency audit.

## Current Constraints

- AI responses use deterministic mock providers by default.
- Redis is configured for the deployment topology, but background queues are not active yet.
- Authentication and role-based authorization are planned hardening items.
- Prisma migrations should replace `db push` before production deployment.
