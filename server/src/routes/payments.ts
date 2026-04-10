import express from "express";
import { z } from "zod";
import { inArray } from "drizzle-orm";
import { db } from "../db/drizzle";
import { books } from "../db/schema";
import { stripe } from "../lib/stripe";
import { authMiddleware, AuthRequest } from "../middleware/auth";

const router = express.Router();

const createIntentSchema = z.object({
  items: z
    .array(
      z.object({
        bookId: z.number().int().positive(),
        quantity: z.number().int().positive(),
      }),
    )
    .min(1),
});

// Create a Stripe PaymentIntent — backend recomputes the total from DB prices,
// never trusts any amount from the client.
router.post("/create-intent", authMiddleware, async (req: AuthRequest, res) => {
  const result = createIntentSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ success: false, error: result.error.issues });
    return;
  }
  const { items } = result.data;

  try {
    // Fetch real prices from DB
    const bookIds = items.map((i) => i.bookId);
    const bookRows = await db
      .select({ id: books.id, price: books.price })
      .from(books)
      .where(inArray(books.id, bookIds));

    const bookMap = new Map(bookRows.map((b) => [b.id, b])); // create a map of bookId to book data for easy lookup

    const missingId = bookIds.find((id) => !bookMap.has(id));
    if (missingId) {
      res
        .status(400)
        .json({ success: false, error: `Book ${missingId} not found` });
      return;
    }

    // Recalculate totals server-side (matches orders.ts)
    // Each i: bookId, quantity
    const subtotal = items.reduce(
      (sum, i) => sum + bookMap.get(i.bookId)!.price * i.quantity,
      0,
    );
    const surcharge = subtotal * 0.05;
    const total = subtotal + surcharge;

    // Stripe expects the amount in the smallest currency unit (cents for USD)
    const amountInCents = Math.round(total * 100);

    const intent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: "usd",
      automatic_payment_methods: { enabled: true },
      metadata: {
        userId: String(req.userId ?? ""),
      },
    });

    res.json({
      clientSecret: intent.client_secret,
      paymentIntentId: intent.id,
      subtotal,
      surcharge,
      total,
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, error: "Failed to create payment intent" });
  }
});

export default router;
