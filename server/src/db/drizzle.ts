// Centralizes the Drizzle ORM configuration
import { drizzle } from "drizzle-orm/node-postgres"; // 'drizzle' creates an ORM instance to execute queries.
import { Pool } from "pg"; // PostgreSQL client, which manages database connections.
import * as schema from "./schema";

import { config } from "dotenv";
config(); // Load environment variables from .env

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
}); // creates a connection pool to the database.

// Initializes Drizzle ORM with the PostgreSQL connection pool.
// 'db' will be used throughout the application to interact with the database.
export const db = drizzle(pool, { schema });
