import { config } from "dotenv";
config(); // Load environment variables from .env

export default {
  out: "./migrations", // Directory to store migration files
  schema: "./src/db/schema.ts", // Path to schema file
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL, // Database URL from .env
    ssl: true, // Enable SSL for NeonDB
  },
};
