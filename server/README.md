# Bright Sun Bookstore — Backend

Express + TypeScript backend. Runs as a standalone server locally; in production it is wrapped by the root `api/index.ts` Vercel serverless function and mounted under `/api`.

## Tech Stack

- Node.js + Express + TypeScript
- Drizzle ORM + PostgreSQL (NeonDB)
- Zod for request validation
- JWT + bcrypt auth (JWT stored in an httpOnly cookie)
- Stripe for payments

## Project Structure

```
src/
├── app.ts               Express app (shared by local server.ts and api/index.ts)
├── server.ts            local entry point
├── routes/              books / categories / orders / auth / payments
├── middleware/auth.ts   JWT auth middleware
└── db/schema.ts         Drizzle schema: users, categories, books, customers, orders, lineItems
migrations/              Drizzle migration files
drizzle.config.ts
```

## Authentication

- Registration / login hash passwords with bcrypt and issue a JWT
- JWT is stored in an httpOnly cookie, 7-day expiry; `sameSite=none` in production
- `POST /orders` requires auth; guest orders are supported via a nullable `userId` FK
- `GET /orders` (user order history) requires auth

## Commands

```sh
npm install
npm run dev           # nodemon + ts-node on port 8000
npm run build         # compile to dist/ with tsc
npm run start         # run dist/server.js
npm run db:generate   # generate Drizzle migrations
npm run db:push       # apply migrations to the database
npm run db:seed       # seed initial data
npm run studio        # open Drizzle Studio
```

## Environment Variables

See `.env.example`: `DATABASE_URL`, `JWT_SECRET`, `STRIPE_SECRET_KEY`, `CORS_ORIGIN`, `PORT`.

## About Drizzle ORM

- Interact with the database through TypeScript instead of raw SQL, with full type safety
- Schema changes can be turned into migration scripts automatically, so the database structure can be updated safely
