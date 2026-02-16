# Architecture

AI Ops Studio is a full-stack monorepo with a React dashboard, Express API, shared TypeScript schemas, and a planned PostgreSQL/Prisma data layer.

```txt
User
  |
React frontend
  |
RTK Query
  |
Express API
  |
Modules: Requirements, Operations, RAG, AI Control, Audit
  |
PostgreSQL, Redis, object storage, AI provider
```

The first implementation slice establishes the application shell and API boundary. Later slices add database-backed workflows, background jobs, and AI provider implementations.
