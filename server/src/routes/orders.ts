import express from "express";
import { db } from "../db/drizzle";
import { eq } from "drizzle-orm";
import { orders, lineItems, customers } from "../db/schema";

const router = express.Router();

// Check confirmation number uniqueness
router.post("/check-confirmation-number", async (req, res) => {
  const { confirmationNumber } = req.body;

  const existingOrder = await db
    .select()
    .from(orders)
    .where(eq(orders.confirmationNumber, confirmationNumber));
  res.json({ isUnique: existingOrder.length === 0 });
});

// Add a new order
router.post("/", async (req, res) => {
  const { customer, items, confirmationNumber, date } = req.body;

  console.log("From Backend, adding order: ");
  console.log("customer: ", customer);
  console.log("items: ", items);
  console.log("confirmationNumber: ", confirmationNumber);
  console.log("date: ", date);

  try {
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
          customerId: customerId.id, // Reference the inserted customer's ID
        })
        .returning({ id: orders.id });

      // Insert into line_items table
      await trx.insert(lineItems).values(
        items.map((item: { bookId: number; quantity: number }) => ({
          orderId: orderId.id, // Reference the inserted order's ID
          bookId: item.bookId,
          quantity: item.quantity,
        }))
      );
    });
    console.log("Order saved successfully");
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Failed to save order" });
  }
});

export default router;
