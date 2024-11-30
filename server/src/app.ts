import express from "express";
import booksRouter from "./routes/books";
import categoriesRouter from "./routes/categories";
import ordersRouter from "./routes/orders";
import cors from "cors";

const app = express(); // Initializes the Express application

app.use(cors());
app.use(express.json()); // Middleware in Express that is used for parsing incoming requests with JSON payload

app.get("/", (_, res) => {
  res.send("Welcome to the Bookstore API!");
});

app.use("/books", booksRouter);
app.use("/categories", categoriesRouter);
app.use("/orders", ordersRouter);

export default app;
