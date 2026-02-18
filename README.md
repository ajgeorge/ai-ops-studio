# AI Ops Studio

AI Ops Studio is a production-inspired case-study platform for building AI-powered internal tools. It demonstrates structured requirements generation, operations decision support, RAG evaluation, human approval flows, AI run logging, prompt versioning, and deployment-ready full-stack architecture.

## Modules

- **Requirements Engine**: Converts rough client briefs into requirements, questions, scope, user stories, data models, API suggestions, and proposal drafts.
- **Operations Copilot**: Simulates field-service operations with deterministic technician recommendations and AI-generated explanations.
- **RAG Evaluation Lab**: Lets users ask questions against documents, inspect retrieved chunks, and evaluate answer quality.
- **AI Control Center**: Tracks AI runs, prompt versions, validation status, latency, and failures.

## Tech Stack

- React, Vite, TypeScript, Tailwind CSS, Redux Toolkit Query
- Node.js, Express, TypeScript, Zod
- Prisma, PostgreSQL, Redis, BullMQ
- Jest and Supertest
- Docker Compose and GitHub Actions

## Local Setup

```bash
npm install
npm run db:generate
npm run build
npm run test
npm run dev
```

PowerShell may block `npm.ps1` on some Windows machines. If that happens, use `npm.cmd install`, `npm.cmd run build`, and so on.

## Workspace Layout

```txt
apps/
  api/      Express API
  web/      React dashboard
packages/
  shared/   Shared schemas, constants, and types
prisma/     Database schema and seed data
docs/       Architecture, AI workflow, database, deployment, and ADR notes
```

## Environment

Copy `.env.example` to `.env` and keep `AI_PROVIDER=mock` for local demo mode without API keys.

## Database

The Prisma schema targets PostgreSQL. For local development, set `DATABASE_URL`, then run:

```bash
npm run db:push
npm run db:seed
```

## Status

This repository is being built in feature slices. The first slice establishes the monorepo foundation, local development scripts, API health endpoint, and dashboard shell.
