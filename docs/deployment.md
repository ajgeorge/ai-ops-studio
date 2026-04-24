# Deployment

AI Ops Studio can run locally with npm workspaces or as a Docker Compose stack.

## Local Development

```bash
npm install
npm run db:generate
npm run db:push
npm run db:seed
npm run dev
```

The local app expects:

- Web: `http://localhost:5173`
- API: `http://localhost:3000/api`
- PostgreSQL: `postgresql://postgres:postgres@localhost:5432/ai_ops_studio`
- Redis: `redis://localhost:6379`

## Docker Compose

```bash
npm run docker:up
```

Compose starts PostgreSQL, Redis, the Express API, and an nginx-served web build. The API container waits for PostgreSQL and Redis health checks, applies the Prisma schema, seeds demo data, and then starts the server.

```bash
npm run docker:logs
npm run docker:down
```

## CI

`.github/workflows/ci.yml` runs on pushes and pull requests to `main`.

The job performs:

- `npm ci`
- `npm run typecheck`
- `npm run test`
- `npm run build`
- `npm audit --omit=dev`

## Production Notes

Before production use:

- Replace `prisma db push` with generated Prisma migrations.
- Move secrets into the hosting platform secret manager.
- Set a real `DATABASE_URL`, `REDIS_URL`, `APP_URL`, `API_URL`, and `VITE_API_URL`.
- Add authentication, role-based access, and per-action authorization checks.
- Add request tracing, structured logs, metrics, and alerting.
- Configure backups and retention for PostgreSQL.
- Decide whether AI run payloads should be redacted, retained, or exported for compliance review.
