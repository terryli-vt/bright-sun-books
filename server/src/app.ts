import express from "express";
import booksRouter from "./routes/books";
import categoriesRouter from "./routes/categories";

const app = express();

app.use(express.json());
app.use("/books", booksRouter);
app.use("/categories", categoriesRouter);

export default app;
