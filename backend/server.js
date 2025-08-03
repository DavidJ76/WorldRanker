import express from "express";
import mysql from "mysql";
import bodyParser from "body-parser";
import cors from "cors";

const app = express();
const port = 3006;

app.use(bodyParser.json());
app.use(cors());

const db = mysql.createConnection({
  host: "127.0.0.1",
  user: "root",
  password: "123456",
  database: "worldranker",
});

db.connect((err) => {
  if (err) throw err;
  console.log("Connected to MySQL Database");
});

// CREATE //
app.post("/reviews", (req, res) => {
  const { country_id, username, comment } = req.body;
  if (!country_id || !username || !comment) {
    return res
      .status(400)
      .json({ error: "country_id, username and comment are required" });
  }
  db.query(
    "INSERT INTO reviews (country_id, username, comment) VALUES (?, ?, ?)",
    [country_id, username, comment],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.status(201).json({ insertId: result.insertId });
    }
  );
});

// READ  //
app.get("/reviews/:country_id", (req, res) => {
  const { country_id } = req.params;
  db.query(
    "SELECT id, username, comment, created_at FROM reviews WHERE country_id = ? ORDER BY created_at DESC",
    [country_id],
    (err, rows) => {
      if (err) return res.status(500).json(err);
      res.json(rows);
    }
  );
});

// DELETE //
app.delete("/reviews/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM reviews WHERE id = ?", [id], (err, result) => {
    if (err) return res.status(500).json(err);
    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Not found" });
    res.json({ message: "Deleted", affectedRows: result.affectedRows });
  });
});

app.listen(port, () => {});
