import express from "express";
import { db } from "../db/drizzle";
import { eq } from "drizzle-orm";
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

// Endpoint to retrieve a book by its ID
router.get("/:id", async (req: any, res: any) => {
  try {
    const bookId = parseInt(req.params.id);

    if (isNaN(bookId)) {
      return res.status(400).json({ error: "Invalid book ID" });
    }

    const book = await db.select().from(books).where(eq(books.id, bookId));

    if (!book.length) {
      return res.status(404).json({ error: "Book not found" });
    }

    res.json(book);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to retrieve book" });
  }
});

// Endpoint to retrieve books by category
router.get("/categories/:categoryId", async (req: any, res: any) => {
  try {
    const categoryId = parseInt(req.params.categoryId);

    if (isNaN(categoryId)) {
      return res.status(400).json({ error: "Invalid category ID" });
    }

    const booksInCategory = await db
      .select()
      .from(books)
      .where(eq(books.categoryId, categoryId));

    res.json(booksInCategory);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to retrieve books by category" });
  }
});

export default router;
