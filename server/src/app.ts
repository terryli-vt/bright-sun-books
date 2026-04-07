import express from "express";
import booksRouter from "./routes/books";
import categoriesRouter from "./routes/categories";
import ordersRouter from "./routes/orders";
import authRouter from "./routes/auth";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express(); // Initializes the Express application

app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));
app.use(express.json());
app.use(cookieParser()); // Middleware in Express that is used for parsing incoming requests with JSON payload

app.get("/", (_, res) => {
  res.send("Welcome to the Bookstore API!");
});

app.use("/books", booksRouter);
app.use("/categories", categoriesRouter);
app.use("/orders", ordersRouter);
app.use("/auth", authRouter);

export default app;
