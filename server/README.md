# Bright Sun Bookstore - Backend

## Tech

- Express
- Neon DB (serverless, cloud-based PostgreSQL database service)
- Drizzle ORM

### Drizzle ORM

- Helps you interact with a database in your project.
- ORM stands for Object-Relational Mapping, which means it acts as a bridge between your database (like PostgreSQL) and your code.

Benefits of using Drizzle ORM:

- Instead of writing raw SQL queries (which can be hard to manage and prone to errors), Drizzle ORM allows you to use JavaScript/TypeScript code to interact with the database. It simplifies database operations like creating tables, adding data, retrieving data, and more, while ensuring type safety.
- Type Safety: If you make a typo or pass invalid data (e.g., a string instead of a number), TypeScript will warn you before running the code.
- If you need to update your database structure (like adding a new column), Drizzle generates "migrations" for you. These are scripts that update your database safely.

## Commands

- `npm run db:generate` = `npx drizzle-kit generate`
- `npm run db:push` = `npx drizzle-kit push`
- `npx drizzle-kit studio` = `npx drizzle-kit studio` to view the database
