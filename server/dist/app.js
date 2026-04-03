"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const books_1 = __importDefault(require("./routes/books"));
const categories_1 = __importDefault(require("./routes/categories"));
const orders_1 = __importDefault(require("./routes/orders"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)(); // Initializes the Express application
app.use((0, cors_1.default)({ origin: process.env.CORS_ORIGIN }));
app.use(express_1.default.json()); // Middleware in Express that is used for parsing incoming requests with JSON payload
app.get("/", (_, res) => {
    res.send("Welcome to the Bookstore API!");
});
app.use("/books", books_1.default);
app.use("/categories", categories_1.default);
app.use("/orders", orders_1.default);
exports.default = app;
