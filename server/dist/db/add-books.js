"use strict";
/**
 * add-books.ts
 * Inserts additional books into existing categories without touching other data.
 * Run with: npx ts-node src/db/add-books.ts
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const drizzle_1 = require("./drizzle");
const schema_1 = require("./schema");
// Open Library cover URL helper
const cover = (isbn) => `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`;
function addBooks() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Fetch existing categories so we can reference them by name
            const existingCategories = yield drizzle_1.db.select().from(schema_1.categories);
            const catId = (name) => {
                const match = existingCategories.find((c) => c.name === name);
                if (!match)
                    throw new Error(`Category "${name}" not found in database.`);
                return match.id;
            };
            const newBooks = [
                /* ── Art ─────────────────────────────────────────────────── */
                {
                    title: "Steal Like an Artist",
                    author: "Austin Kleon",
                    price: 12.99,
                    categoryId: catId("Art"),
                    imageUrl: cover("9780761169253"),
                },
                {
                    title: "Drawing on the Right Side of the Brain",
                    author: "Betty Edwards",
                    price: 18.5,
                    categoryId: catId("Art"),
                    imageUrl: cover("9781585429202"),
                },
                {
                    title: "The Story of Art",
                    author: "E.H. Gombrich",
                    price: 22.4,
                    categoryId: catId("Art"),
                    imageUrl: cover("9780714832470"),
                },
                {
                    title: "Big Magic: Creative Living Beyond Fear",
                    author: "Elizabeth Gilbert",
                    price: 14.99,
                    categoryId: catId("Art"),
                    imageUrl: cover("9781594634697"),
                },
                /* ── Business ─────────────────────────────────────────────── */
                {
                    title: "Zero to One",
                    author: "Peter Thiel",
                    price: 15.99,
                    categoryId: catId("Business"),
                    imageUrl: cover("9780804139021"),
                },
                {
                    title: "The Lean Startup",
                    author: "Eric Ries",
                    price: 17.5,
                    categoryId: catId("Business"),
                    imageUrl: cover("9780307887894"),
                },
                {
                    title: "Atomic Habits",
                    author: "James Clear",
                    price: 16.99,
                    categoryId: catId("Business"),
                    imageUrl: cover("9780735211292"),
                },
                {
                    title: "Good to Great",
                    author: "Jim Collins",
                    price: 19.95,
                    categoryId: catId("Business"),
                    imageUrl: cover("9780066620992"),
                },
                /* ── Health ───────────────────────────────────────────────── */
                {
                    title: "Why We Sleep",
                    author: "Matthew Walker",
                    price: 16.99,
                    categoryId: catId("Health"),
                    imageUrl: cover("9781501144318"),
                },
                {
                    title: "The Body: A Guide for Occupants",
                    author: "Bill Bryson",
                    price: 18.0,
                    categoryId: catId("Health"),
                    imageUrl: cover("9780385539302"),
                },
                {
                    title: "How Not to Die",
                    author: "Michael Greger",
                    price: 15.99,
                    categoryId: catId("Health"),
                    imageUrl: cover("9781250066114"),
                },
                {
                    title: "Outlive: The Science and Art of Longevity",
                    author: "Peter Attia",
                    price: 21.99,
                    categoryId: catId("Health"),
                    imageUrl: cover("9780593236598"),
                },
                /* ── Science ──────────────────────────────────────────────── */
                {
                    title: "A Brief History of Time",
                    author: "Stephen Hawking",
                    price: 13.99,
                    categoryId: catId("Science"),
                    imageUrl: cover("9780553380163"),
                },
                {
                    title: "Cosmos",
                    author: "Carl Sagan",
                    price: 17.0,
                    categoryId: catId("Science"),
                    imageUrl: cover("9780345539434"),
                },
                {
                    title: "The Selfish Gene",
                    author: "Richard Dawkins",
                    price: 14.99,
                    categoryId: catId("Science"),
                    imageUrl: cover("9780199291151"),
                },
                {
                    title: "The Gene: An Intimate History",
                    author: "Siddhartha Mukherjee",
                    price: 18.99,
                    categoryId: catId("Science"),
                    imageUrl: cover("9781476733524"),
                },
                /* ── Travel ───────────────────────────────────────────────── */
                {
                    title: "Wild: From Lost to Found on the Pacific Crest Trail",
                    author: "Cheryl Strayed",
                    price: 13.99,
                    categoryId: catId("Travel"),
                    imageUrl: cover("9780307476074"),
                },
                {
                    title: "A Walk in the Woods",
                    author: "Bill Bryson",
                    price: 14.5,
                    categoryId: catId("Travel"),
                    imageUrl: cover("9780767902519"),
                },
                {
                    title: "Into Thin Air",
                    author: "Jon Krakauer",
                    price: 15.99,
                    categoryId: catId("Travel"),
                    imageUrl: cover("9780385494786"),
                },
                {
                    title: "Vagabonding",
                    author: "Rolf Potts",
                    price: 13.0,
                    categoryId: catId("Travel"),
                    imageUrl: cover("9780812992182"),
                },
            ];
            const inserted = yield drizzle_1.db.insert(schema_1.books).values(newBooks).returning();
            console.log(`✓ Inserted ${inserted.length} new books:`);
            inserted.forEach((b) => console.log(`  - [${b.id}] ${b.title}`));
            console.log("Done.");
        }
        catch (error) {
            console.error("Error inserting books:", error);
        }
        finally {
            process.exit();
        }
    });
}
addBooks();
