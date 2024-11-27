// Define the database schema using Drizzle ORM
import { integer, pgTable, serial, varchar } from "drizzle-orm/pg-core";

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
});

export const books = pgTable("books", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  author: varchar("author", { length: 255 }),
  imageUrl: varchar("image_url", { length: 255 }), // book cover image URL
  categoryId: integer("category_id").references(() => categories.id), // Foreign key (references categories.id), linking books to their categories.
});
