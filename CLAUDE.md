# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Full-stack online bookstore with separate client and server directories (no root package.json).

- **Client:** Vue 3 + TypeScript, Vite, Vue Router, Pinia, Tailwind CSS + DaisyUI
- **Server:** Node.js + Express + TypeScript, Drizzle ORM, PostgreSQL (NeonDB), Zod validation

## Commands

All commands run from their respective directories (`client/` or `server/`).

### Client (`cd client`)
- `npm run dev` — Vite dev server (port 5173)
- `npm run build` — type-check + production build
- `npm run type-check` — Vue TSC only

### Server (`cd server`)
- `npm run dev` — nodemon with ts-node (auto-reload)
- `npm run build` — `tsc` to `dist/`
- `npm run start` — run compiled `dist/server.js`
- `npm run db:generate` — generate Drizzle migrations
- `npm run db:push` — apply migrations to database
- `npm run db:seed` — seed initial data
- `npm run studio` — Drizzle Studio (visual DB browser)

No test suite is configured.

## Architecture

### Server
- Entry: `server/src/server.ts` → `server/src/app.ts` (Express app)
- Routes in `server/src/routes/`: `books.ts`, `categories.ts`, `orders.ts`, `auth.ts`
- Auth middleware in `server/src/middleware/auth.ts` — JWT in httpOnly cookies, protects routes via `authMiddleware`
- DB schema in `server/src/db/schema.ts` (Drizzle ORM) — tables: users, categories, books, customers, orders, lineItems
- Migrations in `server/migrations/`
- Config: `server/drizzle.config.ts`

### Client
- Vite config + path alias: `@` → `client/src/`
- Router in `client/src/router/` — route guard checks `canAccessCheckout` before checkout
- Pinia stores in `client/src/stores/`: `cart.ts` (localStorage-synced), `category.ts`, `checkout.ts`
- Views in `client/src/views/`, components in `client/src/components/`

### Auth Flow
- Register/login with bcrypt password hashing and JWT
- JWT stored in httpOnly cookie (not localStorage), 7-day expiry
- `POST /orders` requires auth; guest orders supported via nullable `userId` FK

## Environment Variables

Server requires `server/.env` (see `server/.env.example`):
- `DATABASE_URL` — PostgreSQL connection string
- `CORS_ORIGIN` — frontend URL (e.g. `http://localhost:5173`)
- `JWT_SECRET` — secret for signing JWTs
- `PORT` — server port (defaults to 8000)

## Deployment

- Client deployed to Vercel with SPA rewrite (`client/vercel.json`)
- Server TypeScript compiles to `dist/` via `npm run build`
