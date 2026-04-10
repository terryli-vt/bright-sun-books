import express from "express";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import { db } from "../db/drizzle";
import { inArray } from "drizzle-orm";
import { orders, lineItems, customers, books } from "../db/schema";
import { authMiddleware, AuthRequest } from "../middleware/auth";
import { stripe } from "../lib/stripe";

const router = express.Router();

const orderSchema = z.object({
  customer: z.object({
    name: z.string().min(1).max(100),
    address: z.string().min(1).max(200),
    phone: z.string().min(7).max(20),
    email: z.email(),
  }),
  items: z
    .array(
      z.object({
        bookId: z.number().int().positive(),
        quantity: z.number().int().positive(),
      })
    )
    .min(1),
  paymentIntentId: z.string().min(1),
  date: z.iso.datetime(),
});

// Add a new order (requires authentication)
router.post("/", authMiddleware, async (req: AuthRequest, res) => {
  const result = orderSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ success: false, error: result.error.issues });
    return;
  }
  const { customer, items, paymentIntentId, date } = result.data;
  // Generate the confirmation number server-side — UUID collisions are
  // astronomically unlikely, and the unique constraint on the column is the
  // ultimate safety net.
  const confirmationNumber = randomUUID();

  try {
    // Fetch book prices from DB
    const bookIds = items.map((item) => item.bookId);
    const bookRows = await db
      .select({ id: books.id, title: books.title, price: books.price })
      .from(books)
      .where(inArray(books.id, bookIds));

    const bookMap = new Map(bookRows.map((b) => [b.id, b]));

    // Verify all books exist
    const missingId = bookIds.find((id) => !bookMap.has(id));
    if (missingId) {
      res.status(400).json({ success: false, error: `Book ${missingId} not found` });
      return;
    }

    // Calculate totals server-side
    const enrichedItems = items.map((item) => {
      const book = bookMap.get(item.bookId)!;
      return { bookId: item.bookId, name: book.title, price: book.price, quantity: item.quantity };
    });
    const subtotal = enrichedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const surcharge = subtotal * 0.05;
    const total = subtotal + surcharge;
    const expectedAmount = Math.round(total * 100);

    // Verify payment with Stripe before saving the order
    const intent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (intent.status !== "succeeded") {
      res.status(402).json({
        success: false,
        error: `Payment not completed (status: ${intent.status})`,
      });
      return;
    }

    if (intent.amount !== expectedAmount || intent.currency !== "usd") {
      res.status(400).json({
        success: false,
        error: "Payment amount does not match order total",
      });
      return;
    }

    await db.transaction(async (trx) => {
      // Insert into customers table
      const [customerId] = await trx
        .insert(customers)
        .values({
          name: customer.name,
          address: customer.address,
          phone: customer.phone,
          email: customer.email,
        })
        .returning({ id: customers.id });

      // Insert into orders table
      const [orderId] = await trx
        .insert(orders)
        .values({
          confirmationNumber,
          date: new Date(date),
          customerId: customerId.id,
          userId: req.userId,
          paymentIntentId,
        })
        .returning({ id: orders.id });

      // Insert into line_items table
      await trx.insert(lineItems).values(
        enrichedItems.map((item) => ({
          orderId: orderId.id,
          bookId: item.bookId,
          quantity: item.quantity,
        }))
      );
    });

    res.json({
      success: true,
      confirmationNumber,
      subtotal,
      surcharge,
      total,
      items: enrichedItems,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Failed to save order" });
  }
});

export default router;
