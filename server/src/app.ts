import express from "express";
import booksRouter from "./routes/books";
import categoriesRouter from "./routes/categories";

const app = express(); // Initializes the Express application

app.use(express.json()); // Middleware in Express that is used for parsing incoming requests with JSON payload

app.get("/", (_, res) => {
  res.send("Welcome to the Bookstore API!");
});

// Mounts the books and categories routes under /books and /categories endpoints.
app.use("/books", booksRouter);
app.use("/categories", categoriesRouter);

export default app;
