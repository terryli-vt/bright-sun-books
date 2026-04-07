import express from "express";
import { z } from "zod";
import { db } from "../db/drizzle";
import { eq, inArray } from "drizzle-orm";
import { orders, lineItems, customers, books } from "../db/schema";
import { authMiddleware, AuthRequest } from "../middleware/auth";

const router = express.Router();

const orderSchema = z.object({
  customer: z.object({
    name: z.string().min(1).max(100),
    address: z.string().min(1).max(200),
    phone: z.string().min(7).max(20),
    email: z.email(),
    creditCard: z.string().min(13).max(19),
    expMonth: z.string().regex(/^(0[1-9]|1[0-2])$/),
    expYear: z.string().regex(/^\d{4}$/),
  }),
  items: z
    .array(
      z.object({
        bookId: z.number().int().positive(),
        quantity: z.number().int().positive(),
      })
    )
    .min(1),
  confirmationNumber: z.string().min(1),
  date: z.iso.datetime(),
});

// Check confirmation number uniqueness
router.post("/check-confirmation-number", async (req, res) => {
  const { confirmationNumber } = req.body;

  const existingOrder = await db
    .select()
    .from(orders)
    .where(eq(orders.confirmationNumber, confirmationNumber));
  res.json({ isUnique: existingOrder.length === 0 });
});

// Add a new order (requires authentication)
router.post("/", authMiddleware, async (req: AuthRequest, res) => {
  const result = orderSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ success: false, error: result.error.issues });
    return;
  }
  const { customer, items, confirmationNumber, date } = result.data;

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

    await db.transaction(async (trx) => {
      // Insert into customers table
      const [customerId] = await trx
        .insert(customers)
        .values({
          name: customer.name,
          address: customer.address,
          phone: customer.phone,
          email: customer.email,
          cardNumber: customer.creditCard,
          cardExpMonth: customer.expMonth,
          cardExpYear: customer.expYear,
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

    res.json({ success: true, subtotal, surcharge, total, items: enrichedItems });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Failed to save order" });
  }
});

export default router;
