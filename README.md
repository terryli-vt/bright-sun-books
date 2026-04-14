# bright-sun-books

A full-stack online bookstore deployed as a single Vercel project. The client and API share one domain; the Express backend runs as a Vercel serverless function.

## Tech Stack

- **Client:** Vue 3 + TypeScript, Vite, Vue Router, Pinia, Tailwind CSS + DaisyUI
- **Server:** Node.js + Express + TypeScript, Drizzle ORM, PostgreSQL (NeonDB), Zod
- **Auth:** JWT in httpOnly cookies + bcrypt
- **Payments:** Stripe

## Repository Layout

```
/
├── api/index.ts        Vercel serverless entry — mounts server/src/app under /api
├── client/             Vue 3 frontend
├── server/
│   ├── src/            Express app source (imported by api/index.ts)
│   ├── migrations/     Drizzle migrations
│   └── drizzle.config.ts
├── package.json        backend deps for the Vercel serverless function
├── tsconfig.json       compiles api/**/*.ts
└── vercel.json         build config + SPA / API rewrites
```

Both the root `package.json` and `server/package.json` declare backend dependencies: the root is used by Vercel during deployment, while `server/` is used for local Express development and Drizzle CLI. Keep the two in sync when upgrading backend deps.

## Getting Started

### Client

```sh
cd client
npm install
npm run dev          # dev server on port 5173
```

### Server (local development)

```sh
cd server
npm install
npm run dev          # nodemon + ts-node on port 8000
npm run studio       # Drizzle Studio (visual DB browser)
```

## Environment Variables

Configure locally in `server/.env` (see `server/.env.example`); set the same keys in Vercel project settings for production:

- `DATABASE_URL` — PostgreSQL connection string (NeonDB)
- `JWT_SECRET` — secret for signing JWTs
- `STRIPE_SECRET_KEY` — Stripe API key
- `CORS_ORIGIN` — frontend URL for local dev (e.g. `http://localhost:5173`); not needed in production (same origin)
- `PORT` — local server port, defaults to 8000; ignored on Vercel

## Deployment

- A single Vercel project serves both the client static assets and the `api/index.ts` serverless function.
- Build command: `cd client && npm install && npm run build` (defined in `vercel.json`).
- `vercel.json` rewrites: `/api/*` → serverless handler; all other paths → `index.html` (SPA fallback).
- Database migrations are run manually against the production DB via `cd server && npm run db:push`.
