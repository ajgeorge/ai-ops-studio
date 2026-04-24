# AI Ops Studio

AI Ops Studio is a production-inspired case-study platform for AI-powered internal operations tools. It combines a requirements assistant, an operations recommendation workflow, a RAG evaluation lab, and an AI governance console in one TypeScript monorepo.

## Modules

- **Dashboard**: Shows module health, recent AI runs, audit activity, and workflow totals.
- **Requirements Engine**: Converts rough client briefs into structured requirements, questions, risks, user stories, data models, API suggestions, and proposal drafts.
- **Operations Copilot**: Scores field technicians, explains recommendations, and requires human approval before an assignment is accepted.
- **RAG Evaluation Lab**: Stores documents, creates transparent chunks, answers questions with cited context, and scores answer quality.
- **AI Control Center**: Tracks AI runs, prompt versions, validation status, latency, failures, and approval-sensitive events.
- **Audit Logs**: Records user and AI-assisted workflow events for review.

## Tech Stack

- React, Vite, TypeScript, Tailwind CSS, Redux Toolkit Query
- Node.js, Express, TypeScript, Zod
- Prisma, PostgreSQL, Redis-ready configuration
- Jest and Supertest
- Docker Compose and GitHub Actions

## Workspace Layout

```txt
apps/
  api/      Express API and workflow services
  web/      React dashboard
packages/
  shared/   Shared schemas, constants, and types
prisma/     Database schema and seed data
docs/       Architecture, AI workflow, database, deployment, and ADR notes
```

## Local Setup

Use Node 22 and npm 10 or newer.

```bash
npm install
npm run db:generate
npm run db:push
npm run db:seed
npm run dev
```

PowerShell may block `npm.ps1` on some Windows machines. If that happens, use `npm.cmd install`, `npm.cmd run build`, and so on.

## Environment

Copy `.env.example` to `.env`.

```bash
cp .env.example .env
```

Keep `AI_PROVIDER=mock` for local demo mode without API keys. The default local URLs are:

- Web: `http://localhost:5173`
- API: `http://localhost:3000/api`
- Health: `http://localhost:3000/api/health`

## Docker

Docker Compose runs PostgreSQL, Redis, the API, and the web app.

```bash
npm run docker:up
```

The API container applies the Prisma schema and seed data before starting. To stop the stack:

```bash
npm run docker:down
```

## Verification

```bash
npm run typecheck
npm run test
npm run build
npm audit --omit=dev
```

The CI workflow runs the same install, typecheck, test, build, and production dependency audit checks on pushes and pull requests to `main`.

## Documentation

- [Architecture](docs/architecture.md)
- [AI workflows](docs/ai-workflows.md)
- [Database schema](docs/database-schema.md)
- [Evaluation strategy](docs/evaluation-strategy.md)
- [Deployment](docs/deployment.md)
- [ADRs](docs/adr)

## Status

The main demo workflows are implemented with deterministic mock AI behavior and database-backed state. The current app is ready for local review, Docker-based demo runs, and continued hardening around real AI providers, authentication, role-based access, migrations, and production observability.
