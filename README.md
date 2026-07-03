## Current Development Startup

This repository is based on `QuantumNous/new-api`. The current recommended local development flow is:

- backend dependencies and backend service via Docker
- frontend via Bun
- default frontend only unless classic debugging is specifically needed

### 1. Start backend and dependencies

```bash
docker compose -f docker-compose.dev.yml up -d
```

Backend default address:

```text
http://localhost:3000
```

If Go backend code changes, rebuild the backend container:

```bash
docker compose -f docker-compose.dev.yml up -d --build new-api
```

Stop local dev environment:

```bash
docker compose -f docker-compose.dev.yml down
```

If you also want to reset local data volumes:

```bash
docker compose -f docker-compose.dev.yml down -v
```

### 2. Start the default frontend

```bash
cd web/default
bun install
bun run dev -- --host 0.0.0.0 --port 5173
```

Default frontend address:

```text
http://localhost:5173
```

Frontend-only mode is useful for public-page and layout debugging. API-backed pages still need the
backend service above.

### 3. Optional make commands

If `make` is available locally:

```bash
make dev-api
make dev-web
```

Notes:

- `make dev-api` starts Docker backend, PostgreSQL, and Redis
- `make dev-web` starts frontend development service

### 4. Common local config

Development environment configuration is in `docker-compose.dev.yml`:

- `SQL_DSN=postgresql://root:123456@postgres:5432/new-api`
- `REDIS_CONN_STRING=redis://redis`
- `TZ=Asia/Shanghai`
- `BATCH_UPDATE_ENABLED=true`

If you need to fully reset local development data:

```bash
docker compose -f docker-compose.dev.yml down -v
```

---

## Project Notes

For this customized project state, also read:

- `AGENTS.md`
- `docs/README.md`
- `docs/CLAUDE.md`
- `docs/PROJECT_CUSTOMIZATIONS.md`
