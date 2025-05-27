import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 8000;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "booknotes",
  password: "",
  port: 5432,
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

app.get("/", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM books ORDER BY read_date DESC");
    res.render("index.ejs", { books: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading books");
  }
});

app.post("/add", async (req, res) => {
  const { title, author, isbn, rating, notes, read_date } = req.body;
  try {
    await db.query(
      "INSERT INTO books (title, author, isbn, rating, notes, read_date) VALUES ($1, $2, $3, $4, $5, $6)",
      [title, author, isbn, rating, notes, read_date || new Date()]
    );
    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error adding book");
  }
});

app.post("/edit", async (req, res) => {
  const { id, title, author, isbn, rating, notes, read_date } = req.body;
  try {
    await db.query(
      "UPDATE books SET title=$1, author=$2, isbn=$3, rating=$4, notes=$5, read_date=$6 WHERE id=$7",
      [title, author, isbn, rating, notes, read_date, id]
    );
    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error editing book");
  }
});

app.post("/delete", async (req, res) => {
  const id = req.body.id;
  try {
    await db.query("DELETE FROM books WHERE id=$1", [id]);
    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting book");
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
