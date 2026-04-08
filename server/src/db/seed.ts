// 'seed': the initial data setup for a database

/* import { config } from "dotenv";
config(); // Load environment variables from .env
process.env.DATABASE_URL = "...";
console.log("In seed.ts, connecting to:", process.env.DATABASE_URL); */
import { db } from "./drizzle"; // Import the Drizzle database connection
import { categories, books, lineItems, orders, customers } from "./schema"; // Import the schema

// Open Library cover URL helper
const cover = (isbn: string) =>
  `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`;

async function seedDatabase() {
  try {
    console.log("Resetting database...");

    // Delete all records (respect foreign key order)
    await db.delete(lineItems);
    await db.delete(orders);
    await db.delete(customers);
    await db.delete(books);
    await db.delete(categories);

    console.log("All records deleted.");

    // Reset ID sequences so IDs start from 1 again
    await db.execute("ALTER SEQUENCE books_id_seq RESTART WITH 1");
    await db.execute("ALTER SEQUENCE categories_id_seq RESTART WITH 1");

    // Insert Categories
    const insertedCategories = await db
      .insert(categories)
      .values([
        { name: "Art" },
        { name: "Business" },
        { name: "Health" },
        { name: "Science" },
        { name: "Travel" },
      ])
      .returning();

    console.log("Inserted categories:", insertedCategories);

    // Insert Books (8 per category, sorted alphabetically)
    const insertedBooks = await db
      .insert(books)
      .values([
        /* ── Art (A-Z) ──────────────────────────────────────────── */
        {
          title: "Accidentally Wes Anderson",
          author: "Wally Koval",
          categoryId: insertedCategories[0].id,
          price: 14.2,
          imageUrl: cover("9780316492737"),
        },
        {
          title: "Big Magic: Creative Living Beyond Fear",
          author: "Elizabeth Gilbert",
          categoryId: insertedCategories[0].id,
          price: 14.99,
          imageUrl: cover("9781594634697"),
        },
        {
          title: "Drawing on the Right Side of the Brain",
          author: "Betty Edwards",
          categoryId: insertedCategories[0].id,
          price: 18.5,
          imageUrl: cover("9781585429202"),
        },
        {
          title: "Steal Like an Artist",
          author: "Austin Kleon",
          categoryId: insertedCategories[0].id,
          price: 12.99,
          imageUrl: cover("9780761169253"),
        },
        {
          title: "The Art Book",
          author: "Phaidon Editors",
          categoryId: insertedCategories[0].id,
          price: 24.95,
          imageUrl: cover("9780714877358"),
        },
        {
          title: "The Art of Looking Sideways",
          author: "Alan Fletcher",
          categoryId: insertedCategories[0].id,
          price: 29.99,
          imageUrl: cover("9780714834498"),
        },
        {
          title: "The Story of Art",
          author: "E.H. Gombrich",
          categoryId: insertedCategories[0].id,
          price: 22.4,
          imageUrl: cover("9780714832470"),
        },
        {
          title: "The War of Art",
          author: "Steven Pressfield",
          categoryId: insertedCategories[0].id,
          price: 14.99,
          imageUrl: cover("9780316015844"),
        },

        /* ── Business (A-Z) ─────────────────────────────────────── */
        {
          title: "Atomic Habits",
          author: "James Clear",
          categoryId: insertedCategories[1].id,
          price: 16.99,
          imageUrl: cover("9780735211292"),
        },
        {
          title: "Good to Great",
          author: "Jim Collins",
          categoryId: insertedCategories[1].id,
          price: 19.95,
          imageUrl: cover("9780066620992"),
        },
        {
          title: "How to Win Friends and Influence People",
          author: "Dale Carnegie",
          categoryId: insertedCategories[1].id,
          price: 13.71,
          imageUrl: cover("9780671027032"),
        },
        {
          title: "Leadership: Theory and Practice",
          author: "Peter G Northouse",
          categoryId: insertedCategories[1].id,
          price: 30.2,
          imageUrl: cover("9781483317533"),
        },
        {
          title: "The Hard Thing About Hard Things",
          author: "Ben Horowitz",
          categoryId: insertedCategories[1].id,
          price: 16.99,
          imageUrl: cover("9780062273208"),
        },
        {
          title: "The Lean Startup",
          author: "Eric Ries",
          categoryId: insertedCategories[1].id,
          price: 17.5,
          imageUrl: cover("9780307887894"),
        },
        {
          title: "The Richest Man in Babylon",
          author: "George S Clason",
          categoryId: insertedCategories[1].id,
          price: 10.99,
          imageUrl: cover("9780451205360"),
        },
        {
          title: "Think Again: The Power of Knowing What You Don''t Know",
          author: "Adam Grant",
          categoryId: insertedCategories[1].id,
          price: 18.99,
          imageUrl: cover("9781984878106"),
        },

        /* ── Health (A-Z) ───────────────────────────────────────── */
        {
          title: "Eat to Beat Disease",
          author: "William W Li",
          categoryId: insertedCategories[2].id,
          price: 19.2,
          imageUrl: cover("9781538714621"),
        },
        {
          title: "How Not to Die",
          author: "Michael Greger",
          categoryId: insertedCategories[2].id,
          price: 15.99,
          imageUrl: cover("9781250066114"),
        },
        {
          title: "Outlive: The Science and Art of Longevity",
          author: "Peter Attia",
          categoryId: insertedCategories[2].id,
          price: 21.99,
          imageUrl: cover("9780593236598"),
        },
        {
          title: "The 4-Hour Body",
          author: "Timothy Ferriss",
          categoryId: insertedCategories[2].id,
          price: 14.99,
          imageUrl: cover("9780804137386"),
        },
        {
          title: "The Body: A Guide for Occupants",
          author: "Bill Bryson",
          categoryId: insertedCategories[2].id,
          price: 18.0,
          imageUrl: cover("9780385539302"),
        },
        {
          title: "The Easy 5-Ingredient Ketogenic Diet Cookbook",
          author: "Jen Fisch",
          categoryId: insertedCategories[2].id,
          price: 14.2,
          imageUrl: cover("9781939754448"),
        },
        {
          title: "The Sugar Brain Fix",
          author: "Mike Dow",
          categoryId: insertedCategories[2].id,
          price: 13.21,
          imageUrl: cover("9781401956264"),
        },
        {
          title: "Why We Sleep",
          author: "Matthew Walker",
          categoryId: insertedCategories[2].id,
          price: 16.99,
          imageUrl: cover("9781501144318"),
        },

        /* ── Science (A-Z) ──────────────────────────────────────── */
        {
          title: "A Brief History of Time",
          author: "Stephen Hawking",
          categoryId: insertedCategories[3].id,
          price: 13.99,
          imageUrl: cover("9780553380163"),
        },
        {
          title: "Chemistry: The Central Science",
          author: "Theodore L Brown",
          categoryId: insertedCategories[3].id,
          price: 15.16,
          imageUrl: cover("9780134414232"),
        },
        {
          title: "Conceptual Physics",
          author: "Paul G Hewitt",
          categoryId: insertedCategories[3].id,
          price: 21.23,
          imageUrl: cover("9780321909107"),
        },
        {
          title: "Cosmos",
          author: "Carl Sagan",
          categoryId: insertedCategories[3].id,
          price: 17.0,
          imageUrl: cover("9780345539434"),
        },
        {
          title: "Research Design",
          author: "John W Creswell",
          categoryId: insertedCategories[3].id,
          price: 23.0,
          imageUrl: cover("9781452226101"),
        },
        {
          title: "The Gene: An Intimate History",
          author: "Siddhartha Mukherjee",
          categoryId: insertedCategories[3].id,
          price: 18.99,
          imageUrl: cover("9781476733524"),
        },
        {
          title: "The Selfish Gene",
          author: "Richard Dawkins",
          categoryId: insertedCategories[3].id,
          price: 14.99,
          imageUrl: cover("9780199291151"),
        },
        {
          title: "The Sixth Extinction: An Unnatural History",
          author: "Elizabeth Kolbert",
          categoryId: insertedCategories[3].id,
          price: 15.95,
          imageUrl: cover("9780385534260"),
        },

        /* ── Travel (A-Z) ───────────────────────────────────────── */
        {
          title: "A Walk in the Woods",
          author: "Bill Bryson",
          categoryId: insertedCategories[4].id,
          price: 14.5,
          imageUrl: cover("9780767902519"),
        },
        {
          title: "In a Sunburned Country",
          author: "Bill Bryson",
          categoryId: insertedCategories[4].id,
          price: 35.26,
          imageUrl: cover("9780767903868"),
        },
        {
          title: "In Patagonia",
          author: "Bruce Chatwin",
          categoryId: insertedCategories[4].id,
          price: 13.95,
          imageUrl: cover("9780143118381"),
        },
        {
          title: "Into Thin Air",
          author: "Jon Krakauer",
          categoryId: insertedCategories[4].id,
          price: 15.99,
          imageUrl: cover("9780385494786"),
        },
        {
          title: "Nomadland: Surviving America in the Twenty-First Century",
          author: "Jessica Bruder",
          categoryId: insertedCategories[4].id,
          price: 21.26,
          imageUrl: cover("9780393249316"),
        },
        {
          title: "The Bucket List: 1000 Adventures Big and Small",
          author: "Kath Stathers",
          categoryId: insertedCategories[4].id,
          price: 18.26,
          imageUrl: cover("9780789332691"),
        },
        {
          title: "Vagabonding",
          author: "Rolf Potts",
          categoryId: insertedCategories[4].id,
          price: 13.0,
          imageUrl: cover("9780812992182"),
        },
        {
          title: "Wild: From Lost to Found on the Pacific Crest Trail",
          author: "Cheryl Strayed",
          categoryId: insertedCategories[4].id,
          price: 13.99,
          imageUrl: cover("9780307476074"),
        },
      ])
      .returning();
    console.log(`Inserted ${insertedBooks.length} books.`);

    console.log("Database seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    process.exit();
  }
}

seedDatabase();
