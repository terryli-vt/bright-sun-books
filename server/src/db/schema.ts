// Define the database schema using Drizzle ORM
import {
  integer,
  pgTable,
  serial,
  varchar,
  real,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
});

export const books = pgTable("books", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  author: varchar("author", { length: 255 }),
  imageUrl: varchar("image_url", { length: 255 }), // book cover image URL
  price: real("price").notNull().default(0),
  categoryId: integer("category_id").references(() => categories.id), // Foreign key (references categories.id), linking books to their categories.
});

export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  cardNumber: text("card_number").notNull(),
  cardExpMonth: text("card_exp_month").notNull(),
  cardExpYear: text("card_exp_year").notNull(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  confirmationNumber: text("confirmation_number").notNull().unique(),
  date: timestamp("date").notNull(),
  customerId: integer("customer_id")
    .references(() => customers.id)
    .notNull(),
});

export const lineItems = pgTable("line_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id")
    .references(() => orders.id)
    .notNull(),
  bookId: integer("book_id")
    .references(() => books.id)
    .notNull(),
  quantity: integer("quantity").notNull(),
});
