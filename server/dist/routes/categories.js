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
const schema_1 = require("../db/schema");
const router = express_1.default.Router();
// Fetch all categories
router.get("/", (_, res) => __awaiter(void 0, void 0, void 0, function* () {
    const allCategories = yield drizzle_1.db.select().from(schema_1.categories);
    res.json(allCategories);
}));
// Add a new category
router.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name } = req.body;
    try {
        const newCategory = yield drizzle_1.db
            .insert(schema_1.categories)
            .values({ name })
            .returning();
        res.status(201).json(newCategory);
    }
    catch (error) {
        res.status(400).json({ error: "Failed to add category" });
    }
}));
exports.default = router;
