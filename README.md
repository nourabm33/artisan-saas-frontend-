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
