import express from "express";
import { db } from "../db/drizzle";
import { books } from "../db/schema";

const router = express.Router(); // Creates a router for books-related API endpoints.

// Fetch all books
router.get("/", async (_, res) => {
  const allBooks = await db.select().from(books);
  res.json(allBooks);
});

// Add a new book
router.post("/", async (req, res) => {
  const { title, author, imageUrl, categoryId } = req.body;

  try {
    const newBook = await db
      .insert(books)
      .values({ title, author, imageUrl, categoryId })
      .returning();
    res.status(201).json(newBook);
  } catch (error: any) {
    res.status(400).json({ error: "Failed to add a book" });
  }
});

export default router;
