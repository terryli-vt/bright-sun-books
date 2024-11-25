import express from "express";
import { db } from "../db/drizzle";
import { categories } from "../db/schema";

const router = express.Router();

router.get("/", async (_, res) => {
  const allCategories = await db.select().from(categories);
  res.json(allCategories);
});

router.post("/", async (req, res) => {
  const { name } = req.body;
  console.log("category name = ", name);
  try {
    const newCategory = await db
      .insert(categories)
      .values({ name })
      .returning();
    res.status(201).json(newCategory);
  } catch (error: any) {
    res.status(400).json({ error: error });
  }
});

export default router;
