// 'seed': the initial data setup for a database

/* import { config } from "dotenv";
config(); // Load environment variables from .env
process.env.DATABASE_URL = "...";
console.log("In seed.ts, connecting to:", process.env.DATABASE_URL); */
import { db } from "./drizzle"; // Import the Drizzle database connection
import { categories, books } from "./schema"; // Import the schema

async function seedDatabase() {
  try {
    console.log("Resetting database...");

    // Delete all records from books and categories tables
    await db.delete(books);
    await db.delete(categories);

    console.log("All records deleted.");

    /*
      ALTER SEQUENCE books_id_seq RESTART WITH 1;
      ALTER SEQUENCE categories_id_seq RESTART WITH 1;
    */

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

    // Insert Books
    const insertedBooks = await db
      .insert(books)
      .values([
        /* Art Books */
        {
          title: "Accidentally Wes Anderson",
          author: "Wally Koval",
          categoryId: insertedCategories[0].id,
          price: 14.2,
          imageUrl:
            "https://i.postimg.cc/Z5J4mVf7/Accidentally-Wes-Anderson.jpg",
        },
        {
          title: "Everyday Watercolor: Learn to Paint Watercolor in 30 Days",
          author: "Jenna Rainey",
          categoryId: insertedCategories[0].id,
          price: 15.39,
          imageUrl:
            "https://i.postimg.cc/PJGnR4pM/Everyday-Watercolor-Learn-to-Paint-Watercolor-in-30-Days.jpg",
        },
        {
          title: "The Rise",
          author: "Sarah Lewis",
          categoryId: insertedCategories[0].id,
          price: 24.23,
          imageUrl: "https://i.postimg.cc/5yWD32T7/The-Rise.jpg",
        },
        {
          title: "Understanding Art",
          author: "Lois Fichner-Rathus",
          categoryId: insertedCategories[0].id,
          price: 14.94,
          imageUrl: "https://i.postimg.cc/pXZ3fxZC/Understanding-Art.jpg",
        },

        /* Business Books */
        {
          title: "How to Win Friends and Influence People",
          author: "Dale Carnegie",
          categoryId: insertedCategories[1].id,
          price: 13.71,
          imageUrl:
            "https://i.postimg.cc/W3qP8K33/How-to-Win-Friends-and-Influence-People.jpg",
        },
        {
          title: "Leadership: Theory and Practice",
          author: "Peter G Northouse",
          categoryId: insertedCategories[1].id,
          price: 30.2,
          imageUrl:
            "https://i.postimg.cc/QCpZGTcZ/Leadership-Theory-and-Practice.jpg",
        },
        {
          title: "Think Again: The Power of Knowing What You Don''t Know",
          author: "Adam Grant",
          categoryId: insertedCategories[1].id,
          price: 18.99,
          imageUrl:
            "https://i.postimg.cc/hPgHQh9h/Think-Again-The-Power-of-Knowing-What-You-Don-t-Know.jpg",
        },
        {
          title: "The Richest Man in Babylon",
          author: "George S Clason",
          categoryId: insertedCategories[1].id,
          price: 10.99,
          imageUrl:
            "https://i.postimg.cc/XqKmD00V/The-Richest-Man-in-Babylon.jpg",
        },

        /* Health Books */
        {
          title: "Eat to Beat Disease",
          author: "William W Li",
          categoryId: insertedCategories[2].id,
          price: 19.2,
          imageUrl: "https://i.postimg.cc/g0TWvdGQ/Eat-to-Beat-Disease.jpg",
        },
        {
          title: "The Easy 5-Ingredient Ketogenic Diet Cookbook",
          author: "Jen Fisch",
          categoryId: insertedCategories[2].id,
          price: 14.2,
          imageUrl:
            "https://i.postimg.cc/bJtKktCS/The-Easy-5-Ingredient-Ketogenic-Diet-Cookbook.jpg",
        },
        {
          title: "The Sugar Brain Fix",
          author: "Mike Dow",
          categoryId: insertedCategories[2].id,
          price: 13.21,
          imageUrl: "https://i.postimg.cc/Y2Q5SQLJ/The-Sugar-Brain-Fix.jpg",
        },
        {
          title: "Stretching to Stay Young",
          author: "Jessica Matthews",
          categoryId: insertedCategories[2].id,
          price: 14.48,
          imageUrl:
            "https://i.postimg.cc/JzTVLmH0/Stretching-to-Stay-Young.jpg",
        },

        /* Science Books */
        {
          title: "Research Design",
          author: "John W Creswell",
          categoryId: insertedCategories[3].id,
          price: 23.0,
          imageUrl: "https://i.postimg.cc/xT2SG6Sf/Research-Design.jpg",
        },
        {
          title: "Chemistry: The Central Science",
          author: "Theodore L Brown",
          categoryId: insertedCategories[3].id,
          price: 15.16,
          imageUrl:
            "https://i.postimg.cc/LsXSYhFj/Chemistry-The-Central-Science.jpg",
        },
        {
          title: "Conceptual Physics",
          author: "Paul G Hewitt",
          categoryId: insertedCategories[3].id,
          price: 21.23,
          imageUrl: "https://i.postimg.cc/Dw5FwLH2/Conceptual-Physics.jpg",
        },
        {
          title: "A World on the Wing: The Global Odyssey of Migratory Birds",
          author: "Scott Weidensaul",
          categoryId: insertedCategories[3].id,
          price: 11.3,
          imageUrl:
            "https://i.postimg.cc/6qqd2r5C/A-World-on-the-Wing-The-Global-Odyssey-of-Migratory-Birds.jpg",
        },

        /* Travel Books */
        {
          title: "Nomadland: Surviving America in the Twenty-First Century",
          author: "Jessica Bruder",
          categoryId: insertedCategories[4].id,
          price: 21.26,
          imageUrl:
            "https://i.postimg.cc/TYJvtnRr/Nomadland-Surviving-America-in-the-Twenty-First-Century.jpg",
        },
        {
          title: "The Bucket List: 1000 Adventures Big and Small",
          author: "Kath Stathers",
          categoryId: insertedCategories[4].id,
          price: 18.26,
          imageUrl:
            "https://i.postimg.cc/GpH03NvQ/The-Bucket-List-1000-Adventures-Big-and-Small.jpg",
        },
        {
          title: "Lonely Planet Yellowstone & Grand Teton National Parks",
          author: "Lonely Planet, Bradley Mayhew, Carolyn McCarthy",
          categoryId: insertedCategories[4].id,
          price: 11.16,
          imageUrl:
            "https://i.postimg.cc/T32MFhwB/Lonely-Planet-Yellowstone-Grand-Teton-National-Parks.jpg",
        },
        {
          title: "In a Sunburned Country",
          author: "Bill Bryson",
          categoryId: insertedCategories[4].id,
          price: 35.26,
          imageUrl: "https://i.postimg.cc/HW5g7fRv/In-a-Sunburned-Country.jpg",
        },
      ])
      .returning();
    console.log("Inserted books:", insertedBooks);

    console.log("Database seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    process.exit();
  }
}

seedDatabase();
