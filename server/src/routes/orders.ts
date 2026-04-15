import express from "express";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import { db } from "../db/drizzle";
import { eq, inArray } from "drizzle-orm";
import { orders, lineItems, customers, books } from "../db/schema";
import { authMiddleware, AuthRequest } from "../middleware/auth";
import { stripe } from "../lib/stripe";
import { computeTotals } from "../lib/pricing";

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

// Get all orders for the logged-in user (with line items)
router.get("/", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userOrders = await db
      .select({
        orderId: orders.id,
        confirmationNumber: orders.confirmationNumber,
        date: orders.date,
        customerName: customers.name,
        customerEmail: customers.email,
        customerAddress: customers.address,
        customerPhone: customers.phone,
      })
      .from(orders)
      .innerJoin(customers, eq(orders.customerId, customers.id))
      .where(eq(orders.userId, req.userId!));

    const orderIds = userOrders.map((o) => o.orderId);

    // Fetch all line items for these orders in one query
    const items =
      orderIds.length > 0
        ? await db
            .select({
              orderId: lineItems.orderId,
              bookId: books.id,
              title: books.title,
              author: books.author,
              price: books.price,
              quantity: lineItems.quantity,
            })
            .from(lineItems)
            .innerJoin(books, eq(lineItems.bookId, books.id))
            .where(inArray(lineItems.orderId, orderIds))
        : [];

    // Group line items by orderId
    const itemsByOrder = new Map<number, typeof items>();
    for (const item of items) {
      if (!itemsByOrder.has(item.orderId)) itemsByOrder.set(item.orderId, []);
      itemsByOrder.get(item.orderId)!.push(item);
    }

    const result = userOrders.map((order) => {
      const orderItems = itemsByOrder.get(order.orderId) ?? [];
      return {
        id: order.orderId,
        confirmationNumber: order.confirmationNumber,
        date: order.date,
        customer: {
          name: order.customerName,
          email: order.customerEmail,
          address: order.customerAddress,
          phone: order.customerPhone,
        },
        items: orderItems.map(({ orderId: _orderId, ...rest }) => rest),
        ...computeTotals(orderItems),
      };
    });

    res.json({ success: true, orders: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Failed to fetch orders" });
  }
});

// Get a single order by ID (verify ownership)
router.get("/:id", authMiddleware, async (req: AuthRequest, res) => {
  const orderId = parseInt(req.params.id, 10);
  if (isNaN(orderId)) {
    res.status(400).json({ success: false, error: "Invalid order ID" });
    return;
  }

  try {
    const [order] = await db
      .select({
        orderId: orders.id,
        confirmationNumber: orders.confirmationNumber,
        date: orders.date,
        userId: orders.userId,
        customerName: customers.name,
        customerEmail: customers.email,
        customerAddress: customers.address,
        customerPhone: customers.phone,
      })
      .from(orders)
      .innerJoin(customers, eq(orders.customerId, customers.id))
      .where(eq(orders.id, orderId));

    if (!order) {
      res.status(404).json({ success: false, error: "Order not found" });
      return;
    }

    if (order.userId !== req.userId) {
      res.status(403).json({ success: false, error: "Access denied" });
      return;
    }

    const items = await db
      .select({
        bookId: books.id,
        title: books.title,
        author: books.author,
        imageUrl: books.imageUrl,
        price: books.price,
        quantity: lineItems.quantity,
      })
      .from(lineItems)
      .innerJoin(books, eq(lineItems.bookId, books.id))
      .where(eq(lineItems.orderId, orderId));

    res.json({
      success: true,
      order: {
        id: order.orderId,
        confirmationNumber: order.confirmationNumber,
        date: order.date,
        customer: {
          name: order.customerName,
          email: order.customerEmail,
          address: order.customerAddress,
          phone: order.customerPhone,
        },
        items,
        ...computeTotals(items),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Failed to fetch order" });
  }
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
      .select({
        id: books.id,
        title: books.title,
        author: books.author,
        imageUrl: books.imageUrl,
        price: books.price,
      })
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
      return {
        bookId: item.bookId,
        title: book.title,
        author: book.author,
        imageUrl: book.imageUrl,
        price: book.price,
        quantity: item.quantity,
      };
    });
    const { subtotal, surcharge, total } = computeTotals(enrichedItems);
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
