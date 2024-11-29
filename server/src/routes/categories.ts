import express from "express";
import { db } from "../db/drizzle";
import { categories } from "../db/schema";

const router = express.Router();

// Fetch all categories
router.get("/", async (_, res) => {
  const allCategories = await db.select().from(categories);
  res.json(allCategories);
});

// Add a new category
router.post("/", async (req, res) => {
  const { name } = req.body;
  try {
    const newCategory = await db
      .insert(categories)
      .values({ name })
      .returning();
    res.status(201).json(newCategory);
  } catch (error: any) {
    res.status(400).json({ error: "Failed to add category" });
  }
});

export default router;
