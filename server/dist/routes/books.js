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
const drizzle_1 = require("../db/drizzle");
const drizzle_orm_1 = require("drizzle-orm");
const schema_1 = require("../db/schema");
const router = express_1.default.Router(); // Creates a router for books-related API endpoints.
// Fetch all books
router.get("/", (_, res) => __awaiter(void 0, void 0, void 0, function* () {
    const allBooks = yield drizzle_1.db.select().from(schema_1.books);
    res.json(allBooks);
}));
// Add a new book
router.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { title, author, imageUrl, categoryId } = req.body;
    try {
        const newBook = yield drizzle_1.db
            .insert(schema_1.books)
            .values({ title, author, imageUrl, categoryId })
            .returning();
        res.status(201).json(newBook);
    }
    catch (error) {
        res.status(400).json({ error: "Failed to add a book" });
    }
}));
// Endpoint to retrieve a book by its ID
router.get("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const bookId = parseInt(req.params.id);
        if (isNaN(bookId)) {
            return res.status(400).json({ error: "Invalid book ID" });
        }
        const book = yield drizzle_1.db.select().from(schema_1.books).where((0, drizzle_orm_1.eq)(schema_1.books.id, bookId));
        if (!book.length) {
            return res.status(404).json({ error: "Book not found" });
        }
        res.json(book);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to retrieve book" });
    }
}));
// Endpoint to retrieve books by category
router.get("/categories/:categoryId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categoryId = parseInt(req.params.categoryId);
        if (isNaN(categoryId)) {
            return res.status(400).json({ error: "Invalid category ID" });
        }
        const booksInCategory = yield drizzle_1.db
            .select()
            .from(schema_1.books)
            .where((0, drizzle_orm_1.eq)(schema_1.books.categoryId, categoryId));
        res.json(booksInCategory);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to retrieve books by category" });
    }
}));
exports.default = router;
