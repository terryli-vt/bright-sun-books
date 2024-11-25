import express from "express";
import { db } from "../db/drizzle";
import { books, categories } from "../db/schema";

const router = express.Router();

router.get("/", async (_, res) => {
  const allBooks = await db.select().from(books);
  res.json(allBooks);
});

router.post("/", async (req, res) => {
  const { title, author, categoryId } = req.body;

  try {
    const newBook = await db
      .insert(books)
      .values({ title, author, categoryId })
      .returning();
    res.status(201).json(newBook);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
