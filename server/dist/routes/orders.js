"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const zod_1 = require("zod");
const drizzle_1 = require("../db/drizzle");
const drizzle_orm_1 = require("drizzle-orm");
const schema_1 = require("../db/schema");
const router = express_1.default.Router();
const orderSchema = zod_1.z.object({
    customer: zod_1.z.object({
        name: zod_1.z.string().min(1).max(100),
        address: zod_1.z.string().min(1).max(200),
        phone: zod_1.z.string().min(7).max(20),
        email: zod_1.z.email(),
        creditCard: zod_1.z.string().min(13).max(19),
        expMonth: zod_1.z.string().regex(/^(0[1-9]|1[0-2])$/),
        expYear: zod_1.z.string().regex(/^\d{4}$/),
    }),
    items: zod_1.z
        .array(zod_1.z.object({
        bookId: zod_1.z.number().int().positive(),
        quantity: zod_1.z.number().int().positive(),
    }))
        .min(1),
    confirmationNumber: zod_1.z.string().min(1),
    date: zod_1.z.iso.datetime(),
});
// Check confirmation number uniqueness
router.post("/check-confirmation-number", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { confirmationNumber } = req.body;
    const existingOrder = yield drizzle_1.db
        .select()
        .from(schema_1.orders)
        .where((0, drizzle_orm_1.eq)(schema_1.orders.confirmationNumber, confirmationNumber));
    res.json({ isUnique: existingOrder.length === 0 });
}));
// Add a new order
router.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = orderSchema.safeParse(req.body);
    if (!result.success) {
        res.status(400).json({ success: false, error: result.error.issues });
        return;
    }
    const { customer, items, confirmationNumber, date } = result.data;
    try {
        // Fetch book prices from DB
        const bookIds = items.map((item) => item.bookId);
        const bookRows = yield drizzle_1.db
            .select({ id: schema_1.books.id, title: schema_1.books.title, price: schema_1.books.price })
            .from(schema_1.books)
            .where((0, drizzle_orm_1.inArray)(schema_1.books.id, bookIds));
        const bookMap = new Map(bookRows.map((b) => [b.id, b]));
        // Verify all books exist
        const missingId = bookIds.find((id) => !bookMap.has(id));
        if (missingId) {
            res.status(400).json({ success: false, error: `Book ${missingId} not found` });
            return;
        }
        // Calculate totals server-side
        const enrichedItems = items.map((item) => {
            const book = bookMap.get(item.bookId);
            return { bookId: item.bookId, name: book.title, price: book.price, quantity: item.quantity };
        });
        const subtotal = enrichedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const surcharge = subtotal * 0.05;
        const total = subtotal + surcharge;
        yield drizzle_1.db.transaction((trx) => __awaiter(void 0, void 0, void 0, function* () {
            // Insert into customers table
            const [customerId] = yield trx
                .insert(schema_1.customers)
                .values({
                name: customer.name,
                address: customer.address,
                phone: customer.phone,
                email: customer.email,
                cardNumber: customer.creditCard,
                cardExpMonth: customer.expMonth,
                cardExpYear: customer.expYear,
            })
                .returning({ id: schema_1.customers.id });
            // Insert into orders table
            const [orderId] = yield trx
                .insert(schema_1.orders)
                .values({
                confirmationNumber,
                date: new Date(date),
                customerId: customerId.id,
            })
                .returning({ id: schema_1.orders.id });
            // Insert into line_items table
            yield trx.insert(schema_1.lineItems).values(enrichedItems.map((item) => ({
                orderId: orderId.id,
                bookId: item.bookId,
                quantity: item.quantity,
            })));
        }));
        res.json({ success: true, subtotal, surcharge, total, items: enrichedItems });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: "Failed to save order" });
    }
}));
exports.default = router;
