# Artisan SaaS – Dashboard artigiano

Next.js 14 (App Router, TypeScript, Tailwind) dashboard for the [artisan-saas-backend](https://github.com/nourabm33/artisan-saas-backend) API.

Artisans log in and:

- see incoming client requests (`/dashboard/requests`) with service, vehicle data, photos and WhatsApp history
- edit the auto-generated quote (labor hours, discount, notes) and send it to the client on WhatsApp
- manage appointments created when the client accepts (`/dashboard/appointments`): confirm, start, complete, cancel, reschedule
- see per-client history and simple analytics

## Quick start

```bash
cp .env.local.example .env.local   # NEXT_PUBLIC_API_URL=http://localhost:3000
npm install
npm run dev                        # http://localhost:3001
```

The backend must be running on `NEXT_PUBLIC_API_URL` with `CORS_ORIGIN=http://localhost:3001` (the backend's
default). Demo credentials from the backend seed: `demo@gommista.it` / `Password123!`.

## Scripts

```bash
npm run dev            # next dev on :3001
npm run build && npm start
npm run lint           # next lint
npm run typecheck      # tsc --noEmit
npm run format:check   # prettier
npm test               # vitest + testing-library (fetch is mocked, no backend needed)
```

## Production

`next.config.mjs` uses `output: 'standalone'`, disables `X-Powered-By` and sets security headers
(`X-Frame-Options`, `nosniff`, `Referrer-Policy`, `Permissions-Policy`, HSTS) on every route.
`GET /api/health` returns `{ status, version, uptime }` for load balancers and the Docker `HEALTHCHECK`.

```bash
cp .env.production.example .env.production      # NEXT_PUBLIC_API_URL=https://api.example.it
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build
curl localhost:3001/api/health
```

`NEXT_PUBLIC_*` values are inlined at **build** time, so the image is built per environment
(`--build-arg NEXT_PUBLIC_API_URL=...`); the release workflow reads it from the repository variable
`NEXT_PUBLIC_API_URL`. The image runs as the `node` user on `:3001`. Terminate TLS in a reverse proxy
(same one as the backend — see `artisan-saas-backend/DEPLOYMENT.md`) and set the backend's
`CORS_ORIGIN` to this app's public origin.

GitHub Actions workflows (CI: lint/format/typecheck/test/build + image smoke test; release: GHCR
publish on `main`/`v*` tags) are in `deploy/github-workflows/` — the PR bot lacks the `workflow` scope,
so enable them once with:

```bash
mkdir -p .github/workflows && cp deploy/github-workflows/*.yml .github/workflows/ && git add .github && git commit -m "ci: enable workflows" && git push
```

## Structure

```
src/app            routes: / , (auth)/login , (auth)/register , dashboard/{requests,[id],appointments,clients,analytics}
src/components     ui (Button, Card, Badge, Input, Modal), layout (Navbar, Sidebar, Footer), requests, appointments, shared
src/hooks          useAuth (context + localStorage session), useFetch, useRequests, useAppointments, useServiceTemplates
src/lib            api.ts (typed client, auto refresh on 401), auth.ts, constants.ts, format.ts
src/types          backend DTO mirrors
tests              vitest
```

Auth: access/refresh tokens live in `localStorage`; `lib/api.ts` retries a request once after refreshing on 401 and
clears the session (redirecting to `/login`) when the refresh fails.
