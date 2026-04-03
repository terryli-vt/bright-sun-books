"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lineItems = exports.orders = exports.customers = exports.books = exports.categories = void 0;
// Define the database schema using Drizzle ORM
const pg_core_1 = require("drizzle-orm/pg-core");
exports.categories = (0, pg_core_1.pgTable)("categories", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    name: (0, pg_core_1.varchar)("name", { length: 255 }).notNull().unique(),
});
exports.books = (0, pg_core_1.pgTable)("books", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    title: (0, pg_core_1.varchar)("title", { length: 255 }).notNull(),
    author: (0, pg_core_1.varchar)("author", { length: 255 }),
    imageUrl: (0, pg_core_1.varchar)("image_url", { length: 255 }), // book cover image URL
    price: (0, pg_core_1.real)("price").notNull().default(0),
    categoryId: (0, pg_core_1.integer)("category_id").references(() => exports.categories.id), // Foreign key (references categories.id), linking books to their categories.
});
exports.customers = (0, pg_core_1.pgTable)("customers", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    name: (0, pg_core_1.text)("name").notNull(),
    address: (0, pg_core_1.text)("address").notNull(),
    phone: (0, pg_core_1.text)("phone").notNull(),
    email: (0, pg_core_1.text)("email").notNull(),
    cardNumber: (0, pg_core_1.text)("card_number").notNull(),
    cardExpMonth: (0, pg_core_1.text)("card_exp_month").notNull(),
    cardExpYear: (0, pg_core_1.text)("card_exp_year").notNull(),
});
exports.orders = (0, pg_core_1.pgTable)("orders", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    confirmationNumber: (0, pg_core_1.text)("confirmation_number").notNull().unique(),
    date: (0, pg_core_1.timestamp)("date").notNull(),
    customerId: (0, pg_core_1.integer)("customer_id")
        .references(() => exports.customers.id)
        .notNull(),
});
exports.lineItems = (0, pg_core_1.pgTable)("line_items", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    orderId: (0, pg_core_1.integer)("order_id")
        .references(() => exports.orders.id)
        .notNull(),
    bookId: (0, pg_core_1.integer)("book_id")
        .references(() => exports.books.id)
        .notNull(),
    quantity: (0, pg_core_1.integer)("quantity").notNull(),
});
