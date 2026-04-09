import express from "express";
import { z } from "zod";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { db } from "../db/drizzle";
import { eq } from "drizzle-orm";
import { users } from "../db/schema";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

const router = express.Router();

const registerSchema = z.object({
  email: z.email(),
  password: z.string().min(8).max(128),
  name: z.string().min(1).max(255),
});

// POST /auth/register
router.post("/register", async (req, res) => {
  const result = registerSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ success: false, error: result.error.issues });
    return;
  }

  const { email, password, name } = result.data;

  try {
    // Check if user already exists
    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email));

    if (existing.length > 0) {
      res
        .status(409)
        .json({ success: false, error: "Email already registered" });
      return;
    }

    // Hash password and create user
    const passwordHash = await bcrypt.hash(password, 10);
    const [user] = await db
      .insert(users)
      .values({ email, passwordHash, name })
      .returning({ id: users.id, email: users.email, name: users.name });

    res.status(201).json({ success: true, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Failed to register user" });
  }
});

const loginSchema = z.object({
  email: z.email(),
  password: z.string(),
});

// POST /auth/login
router.post("/login", async (req, res) => {
  const result = loginSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ success: false, error: result.error.issues });
    return;
  }

  const { email, password } = result.data;

  try {
    const [user] = await db.select().from(users).where(eq(users.email, email));

    if (!user) {
      res
        .status(401)
        .json({ success: false, error: "Invalid email or password" });
      return;
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      res
        .status(401)
        .json({ success: false, error: "Invalid email or password" });
      return;
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      success: true,
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Failed to login" });
  }
});

// POST /auth/logout
router.post("/logout", (_req, res) => {
  res.clearCookie("token");
  res.json({ success: true });
});

// GET /auth/me
router.get("/me", async (req, res) => {
  const token = req.cookies?.token; // Get the token from cookies
  if (!token) {
    res.status(401).json({ success: false, error: "Not authenticated" });
    return;
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: number };
    const [user] = await db
      .select({ id: users.id, email: users.email, name: users.name })
      .from(users)
      .where(eq(users.id, payload.userId));

    if (!user) {
      res.status(401).json({ success: false, error: "User not found" });
      return;
    }

    res.json({ success: true, user });
  } catch {
    res.status(401).json({ success: false, error: "Invalid token" });
  }
});

export default router;
