// 'seed': the initial data setup for a database

/* import { config } from "dotenv";
config(); // Load environment variables from .env
process.env.DATABASE_URL = "...";
console.log("In seed.ts, connecting to:", process.env.DATABASE_URL); */
import { db } from "./drizzle"; // Import the Drizzle database connection
import { categories, books, lineItems, orders, customers } from "./schema"; // Import the schema

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
          imageUrl:
            "https://res.cloudinary.com/dse4uppon/image/upload/v1777392053/Accidentally-Wes-Anderson_csdboq.jpg",
        },
        {
          title: "Big Magic: Creative Living Beyond Fear",
          author: "Elizabeth Gilbert",
          categoryId: insertedCategories[0].id,
          price: 14.99,
          imageUrl:
            "https://res.cloudinary.com/dse4uppon/image/upload/v1777392053/Big-Magic_xcgdmj.jpg",
        },
        {
          title: "Drawing on the Right Side of the Brain",
          author: "Betty Edwards",
          categoryId: insertedCategories[0].id,
          price: 18.5,
          imageUrl:
            "https://res.cloudinary.com/dse4uppon/image/upload/v1777392053/Drawing-on-the-Right_ckqyus.jpg",
        },
        {
          title: "Girl with a Pearl Earring",
          author: "Tracy Chevalier",
          categoryId: insertedCategories[0].id,
          price: 14.99,
          imageUrl:
            "https://res.cloudinary.com/dse4uppon/image/upload/v1777392053/Girl-with-a-Pearl_hmqn3f.jpg",
        },
        {
          title: "Inbetweens",
          author: "Faith Erin Hicks",
          categoryId: insertedCategories[0].id,
          price: 9.99,
          imageUrl:
            "https://res.cloudinary.com/dse4uppon/image/upload/v1777392053/Inbetweens_csbgwu.jpg",
        },
        {
          title: "Lucien",
          author: "J.R. Thornton",
          categoryId: insertedCategories[0].id,
          price: 12.99,
          imageUrl:
            "https://res.cloudinary.com/dse4uppon/image/upload/v1777392053/Lucien_o9ecij.jpg",
        },
        {
          title:
            "Painting Landscapes: Connect to Calm Through the Beauty of Watercolour",
          author: "Inga Buividavice",
          categoryId: insertedCategories[0].id,
          price: 24.95,
          imageUrl:
            "https://res.cloudinary.com/dse4uppon/image/upload/v1777392053/Painting-Landscapes_hiq1zr.jpg",
        },
        {
          title: "Seven Days in the Art World",
          author: "Sarah Thornton",
          categoryId: insertedCategories[0].id,
          price: 11.99,
          imageUrl:
            "https://res.cloudinary.com/dse4uppon/image/upload/v1777392053/Seven-Days_jccx2f.jpg",
        },

        /* ── Business (A-Z) ─────────────────────────────────────── */
        {
          title: "Atomic Habits",
          author: "James Clear",
          categoryId: insertedCategories[1].id,
          price: 16.99,
          imageUrl:
            "https://res.cloudinary.com/dse4uppon/image/upload/v1777396857/Atomic-Habits_cwyqkg.jpg",
        },
        {
          title: "Good to Great",
          author: "Jim Collins",
          categoryId: insertedCategories[1].id,
          price: 19.95,
          imageUrl:
            "https://res.cloudinary.com/dse4uppon/image/upload/v1777396857/Good-to-Great_chgpy3.jpg",
        },
        {
          title: "How to Win Friends and Influence People",
          author: "Dale Carnegie",
          categoryId: insertedCategories[1].id,
          price: 13.71,
          imageUrl:
            "https://res.cloudinary.com/dse4uppon/image/upload/v1777396857/How-to-Win-Friends_qtbfhy.jpg",
        },
        {
          title: "Leadership: Theory and Practice",
          author: "Peter G Northouse",
          categoryId: insertedCategories[1].id,
          price: 30.2,
          imageUrl:
            "https://res.cloudinary.com/dse4uppon/image/upload/v1777396857/Leadership_d4tjrk.jpg",
        },
        {
          title: "Steve Jobs",
          author: "Walter Isaacson",
          categoryId: insertedCategories[1].id,
          price: 16.99,
          imageUrl:
            "https://res.cloudinary.com/dse4uppon/image/upload/v1777396857/Steve-Jobs_hip5i0.jpg",
        },
        {
          title: "The Lean Startup",
          author: "Eric Ries",
          categoryId: insertedCategories[1].id,
          price: 17.5,
          imageUrl:
            "https://res.cloudinary.com/dse4uppon/image/upload/v1777396858/The-Lean-Startup_b7uwyp.jpg",
        },
        {
          title: "The Richest Man in Babylon",
          author: "George S Clason",
          categoryId: insertedCategories[1].id,
          price: 10.99,
          imageUrl:
            "https://res.cloudinary.com/dse4uppon/image/upload/v1777396858/The-Richest_buh4zw.jpg",
        },
        {
          title: "Think Again: The Power of Knowing What You Don''t Know",
          author: "Adam Grant",
          categoryId: insertedCategories[1].id,
          price: 18.99,
          imageUrl:
            "https://res.cloudinary.com/dse4uppon/image/upload/v1777396858/Think-Again_vqhllg.jpg",
        },

        /* ── Health (A-Z) ───────────────────────────────────────── */
        {
          title:
            "Change the Story of Your Health: Using Shamanic and Jungian Techniques for Healing",
          author: "Carl Greer",
          categoryId: insertedCategories[2].id,
          price: 18.0,
          imageUrl:
            "https://res.cloudinary.com/dse4uppon/image/upload/v1777397476/Change-the-Story_qhrxav.jpg",
        },
        {
          title: "Eat to Beat Disease",
          author: "William W Li",
          categoryId: insertedCategories[2].id,
          price: 19.2,
          imageUrl:
            "https://res.cloudinary.com/dse4uppon/image/upload/v1777397476/Eat-to-Beat_w6jlqh.jpg",
        },
        {
          title:
            "Good Energy: The Surprising Connection Between Metabolism and Limitless Health",
          author: "Casey Means",
          categoryId: insertedCategories[2].id,
          price: 14.99,
          imageUrl:
            "https://res.cloudinary.com/dse4uppon/image/upload/v1777397476/Good-Energy_hrmebv.jpg",
        },
        {
          title: "How Not to Die",
          author: "Michael Greger",
          categoryId: insertedCategories[2].id,
          price: 15.99,
          imageUrl:
            "https://res.cloudinary.com/dse4uppon/image/upload/v1777397477/How-Not-to-Die_hmeoat.jpg",
        },
        {
          title: "Outlive: The Science and Art of Longevity",
          author: "Peter Attia",
          categoryId: insertedCategories[2].id,
          price: 21.99,
          imageUrl:
            "https://res.cloudinary.com/dse4uppon/image/upload/v1777397477/Outlive_ilfie0.jpg",
        },
        {
          title: "The Easy 5-Ingredient Ketogenic Diet Cookbook",
          author: "Jen Fisch",
          categoryId: insertedCategories[2].id,
          price: 14.2,
          imageUrl:
            "https://res.cloudinary.com/dse4uppon/image/upload/v1777397477/The_Easy_5-Ingredient_c5nzce.jpg",
        },
        {
          title: "The Sugar Brain Fix",
          author: "Mike Dow",
          categoryId: insertedCategories[2].id,
          price: 13.21,
          imageUrl:
            "https://res.cloudinary.com/dse4uppon/image/upload/v1777397477/Sugar-Brain-Fix_ndzy31.jpg",
        },
        {
          title: "Why We Sleep",
          author: "Matthew Walker",
          categoryId: insertedCategories[2].id,
          price: 16.99,
          imageUrl:
            "https://res.cloudinary.com/dse4uppon/image/upload/v1777397478/Why-We-Sleep_go0ff0.jpg",
        },

        /* ── Science (A-Z) ──────────────────────────────────────── */
        {
          title: "A Brief History of Time",
          author: "Stephen Hawking",
          categoryId: insertedCategories[3].id,
          price: 13.99,
          imageUrl:
            "https://res.cloudinary.com/dse4uppon/image/upload/v1777398142/A_Brief_History_of_Time_b9o9v3.jpg",
        },
        {
          title: "Astrophysics for People in a Hurry",
          author: "Neil deGrasse Tyson",
          categoryId: insertedCategories[3].id,
          price: 9.0,
          imageUrl:
            "https://res.cloudinary.com/dse4uppon/image/upload/v1777398143/Astrophysics_for_People_in_a_Hurry_wjnq3f.jpg",
        },
        {
          title: "Bonded by Evolution: The New Science of Love and Connection",
          author: "Paul Eastwick",
          categoryId: insertedCategories[3].id,
          price: 18.99,
          imageUrl:
            "https://res.cloudinary.com/dse4uppon/image/upload/v1777398143/Bonded_by_Evolution_nnqtb8.jpg",
        },
        {
          title: "Chemistry: The Central Science",
          author: "Theodore L Brown",
          categoryId: insertedCategories[3].id,
          price: 15.16,
          imageUrl:
            "https://res.cloudinary.com/dse4uppon/image/upload/v1777398143/Chemistry_kdf6qh.jpg",
        },
        {
          title: "Conceptual Physics",
          author: "Paul G Hewitt",
          categoryId: insertedCategories[3].id,
          price: 21.23,
          imageUrl:
            "https://res.cloudinary.com/dse4uppon/image/upload/v1777398143/Conceptual-Physics_jxmlsf.jpg",
        },
        {
          title: "The Gene: An Intimate History",
          author: "Siddhartha Mukherjee",
          categoryId: insertedCategories[3].id,
          price: 15.95,
          imageUrl:
            "https://res.cloudinary.com/dse4uppon/image/upload/v1777398144/The_Gene_wnczw6.jpg",
        },
        {
          title:
            "The Laws of Thought: The Quest for a Mathematical Theory of the Mind",
          author: "Tom Griffiths",
          categoryId: insertedCategories[3].id,
          price: 16.99,
          imageUrl:
            "https://res.cloudinary.com/dse4uppon/image/upload/v1777398144/The_Laws_of_Thought_qkgway.jpg",
        },
        {
          title:
            "When the Forest Breathes: Renewal and Resilience in the Natural World",
          author: "Suzanne Simard",
          categoryId: insertedCategories[3].id,
          price: 14.99,
          imageUrl:
            "https://res.cloudinary.com/dse4uppon/image/upload/v1777398145/When-the-Forest-Breathes_j9kmrj.jpg",
        },

        /* ── Travel (A-Z) ───────────────────────────────────────── */
        {
          title: "Call of the Camino",
          author: "Suzanne Redfearn",
          categoryId: insertedCategories[4].id,
          price: 13.0,
          imageUrl:
            "https://res.cloudinary.com/dse4uppon/image/upload/v1777398812/Call_of_the_Camino_kzp5sc.jpg",
        },
        {
          title: "Force of Nature: Three Women Tackle The John Muir Trail",
          author: "Joan M. Griffin",
          categoryId: insertedCategories[4].id,
          price: 13.99,
          imageUrl:
            "https://res.cloudinary.com/dse4uppon/image/upload/v1777398812/Force_of_Nature_eeyxgo.jpg",
        },
        {
          title: "Mrs. Endicott's Splendid Adventure",
          author: "Rhys Bowen",
          categoryId: insertedCategories[4].id,
          price: 13.95,
          imageUrl:
            "https://res.cloudinary.com/dse4uppon/image/upload/v1777398812/Mrs._Endicott_s_Splendid_Adventure_g145mc.jpg",
        },
        {
          title: "People We Meet on Vacation",
          author: "Emily Henry",
          categoryId: insertedCategories[4].id,
          price: 15.99,
          imageUrl:
            "https://res.cloudinary.com/dse4uppon/image/upload/v1777398813/People_We_Meet_on_Vacation_xqu8av.jpg",
        },
        {
          title: "The Bucket List: 1000 Adventures Big and Small",
          author: "Kath Stathers",
          categoryId: insertedCategories[4].id,
          price: 18.26,
          imageUrl:
            "https://res.cloudinary.com/dse4uppon/image/upload/v1777398813/The_Bucket_List_osmvcx.jpg",
        },
        {
          title: "The Paris Match",
          author: "Kate Clayborn",
          categoryId: insertedCategories[4].id,
          price: 35.26,
          imageUrl:
            "https://res.cloudinary.com/dse4uppon/image/upload/v1777398814/The_Paris_Match_agjzht.jpg",
        },
        {
          title:
            "The Road to Little Dribbling: Adventures of an American in Britain",
          author: "Bill Bryson",
          categoryId: insertedCategories[4].id,
          price: 14.5,
          imageUrl:
            "https://res.cloudinary.com/dse4uppon/image/upload/v1777398814/The_Road_to_Little_Dribbling_hq1lho.jpg",
        },
        {
          title: "The View From Lake Como",
          author: "Adriana Trigiani",
          categoryId: insertedCategories[4].id,
          price: 21.26,
          imageUrl:
            "https://res.cloudinary.com/dse4uppon/image/upload/v1777398818/The_View_From_Lake_Como_kpxg3a.jpg",
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
