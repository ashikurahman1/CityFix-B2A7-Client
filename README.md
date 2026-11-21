# CityFix Web — City Complaint & Service Platform (B7A7)

Next.js frontend for the [CityFix API](https://github.com/ashikurahman1/CityFix-B2A6) (B7A6). Citizens report civic
problems and pay for municipal services, department staff claim and resolve the work, and city admins run the
whole operation against SLA deadlines.

```
Project Name      : CityFix - City Complaint & Service Platform
Backend Repo      : https://github.com/ashikurahman1/CityFix-B2A6
Frontend Repo     : https://github.com/ashikurahman1/CityFix-B2A7-Client
Live Backend URL  : https://cityfix-b7a6.netlify.app
Live Frontend URL : <add after deploying>
API Documentation : https://documenter.getpostman.com/view/49370216/2sBYHbrFjo
Demo Admin Email  : admin@cityfix.com
Demo Admin Password: Admin@12345
```

| Role (demo login) | Email | Password |
| --- | --- | --- |
| City Admin | `admin@cityfix.com` | `Admin@12345` |
| Citizen | `citizen@cityfix.com` | `Demo@12345` |
| Department Staff (Roads) | `staff.roads@cityfix.com` | `Demo@12345` |

The login page has one-click **Demo Login** buttons for all three. Stripe runs in test mode: card
`4242 4242 4242 4242`, any future date, any CVC.

## Stack

Next.js 16 (App Router, Turbopack, Cache Components, `proxy.ts`) · React 19 · TypeScript 7 · Tailwind CSS 4 ·
shadcn/ui (Radix) · TanStack Query 5 · Zustand 5 · React Hook Form + Zod 4 · Recharts 3 · Sonner · Lucide · date-fns · jose

## Architecture

```
Browser ──► /api/proxy/* (Route Handler, BFF) ──► CityFix API (Bearer token from httpOnly cookie)
   │        /api/auth/*  (login / register / refresh / logout set & clear cookies)
   │
   └─ page request ──► src/proxy.ts (role guard + silent token rotation) ──► Server Components
                                                                            └─ 'use cache' public reads
```

- **Auth** — access and refresh tokens live in `httpOnly` cookies; JavaScript never sees them. `src/proxy.ts`
  (Next 16's renamed middleware) maps `/dashboard → CITIZEN`, `/staff → STAFF`, `/admin → ADMIN`, redirects anonymous
  users to `/login?next=…` and rotates expired access tokens. The API rotates refresh tokens with reuse detection, so
  the browser client refreshes through a **single-flight** promise (`src/lib/api/client.ts`).
- **Server vs Client Components** — public pages (home, services, about, contact, track, payment result) are Server
  Components; catalogue and stats reads use `'use cache'` + `cacheLife` + `cacheTag("catalog")`, and admin edits call a
  Server Action that runs `updateTag`. Dashboards are client islands because they are per-user, interactive and
  cached in TanStack Query.
- **State** — TanStack Query for server state (keys in `src/lib/query-keys.ts`, optimistic comments and user
  activation, `keepPreviousData` pagination); Zustand for client state (persisted request-wizard draft, recent
  tracking codes); every filter, sort, search and page lives in the URL (`useUrlState`).
- **Errors & loading** — `loading.tsx` skeletons on every data route, `error.tsx` per workspace plus
  `global-error.tsx` and `not-found.tsx`; failed queries and mutations raise Sonner toasts globally.
- **Forms** — React Hook Form + Zod schemas that mirror the API's rules (`src/lib/validations`); server field errors
  are mapped back onto inputs. The 4-step **New request** wizard validates per step.
- **Payments** — `POST /payments/initiate` → Stripe Checkout → `/payment/success` or `/payment/cancel`, which verify
  the session server-side through the API.

## Pages (31 routes)

| Area | Routes |
| --- | --- |
| Public | `/`, `/services`, `/track`, `/about`, `/faq`, `/contact` |
| Auth | `/login` (one-click demo), `/register` |
| Citizen | `/dashboard`, `/dashboard/requests`, `/dashboard/requests/new`, `/dashboard/requests/[id]`, `/dashboard/payments`, `/dashboard/profile` |
| Staff | `/staff` (my tasks), `/staff/queue`, `/staff/tasks/[id]`, `/staff/performance`, `/staff/profile` |
| Admin | `/admin` (analytics), `/admin/complaints`, `/admin/complaints/[id]`, `/admin/users`, `/admin/departments`, `/admin/categories`, `/admin/payments`, `/admin/audit-logs`, `/admin/profile` |
| Payment | `/payment/success`, `/payment/cancel` |
| Utility | custom 404, `error.tsx`, `global-error.tsx` |

## Run locally

```bash
npm install
cp .env.example .env.local   # API_URL defaults to the live API
npm run dev                  # http://localhost:3000
```

| Variable | Purpose |
| --- | --- |
| `API_URL` | CityFix API base, e.g. `https://cityfix-b7a6.netlify.app/api/v1` |
| `NEXT_PUBLIC_SITE_URL` | Public URL of this site (metadata, sitemap) |
| `JWT_ACCESS_SECRET` | Optional. Lets `proxy.ts` verify token signatures |

## Deployment (Vercel)

1. Import the repository in Vercel (framework preset: Next.js).
2. Set `API_URL`, `NEXT_PUBLIC_SITE_URL` (the Vercel URL) and optionally `JWT_ACCESS_SECRET`.
3. On the **API** (Netlify) set `CLIENT_URL` to the Vercel URL so Stripe returns to `/payment/success` and
   `/payment/cancel` on this site.

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build (type-checks) |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint (see note below) |

> `typescript-eslint` does not support TypeScript 7 yet. Until it does, lint with the TS 6 API:
> `npm i --no-save typescript@6 && npm run lint && npm i`.
