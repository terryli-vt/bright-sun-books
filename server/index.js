const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const pool = require("./db");

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Example route
app.get("/", (req, res) => {
  res.send("Welcome to the Bookstore API!");
});

// Get all books
app.get("/books", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM books");
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a single book by ID
app.get("/books/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query("SELECT * FROM books WHERE id = ?", [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add a new book
app.post("/books", async (req, res) => {
  try {
    const { title, author, price, cover_picture_url } = req.body;

    const [result] = await pool.query(
      "INSERT INTO books (title, author, price, cover_picture_url) VALUES (?, ?, ?, ?)",
      [title, author, price, cover_picture_url]
    );

    res
      .status(201)
      .json({ id: result.insertId, message: "Book added successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a book
app.put("/books/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, author, price, cover_picture_url, category_id } = req.body;

    const [result] = await pool.query(
      "UPDATE books SET title = ?, author = ?, price = ?, cover_picture_url = ?, category_id = ? WHERE id = ?",
      [title, author, price, cover_picture_url, category_id, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.status(200).json({ message: "Book updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a book
app.delete("/books/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query("DELETE FROM books WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.status(200).json({ message: "Book deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/books/search", async (req, res) => {
  try {
    const { q } = req.query;

    const [rows] = await pool.query(
      "SELECT * FROM books WHERE title LIKE ? OR author LIKE ?",
      [`%${q}%`, `%${q}%`]
    );
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
