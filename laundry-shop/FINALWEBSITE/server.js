const express = require("express");
const mysql = require("mysql");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// ===== MYSQL CONNECTION =====
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "admin_db"
});

db.connect(err => {
    if (err) console.log(err);
    else console.log("MySQL Connected (admin_db)");
});

// ===== CREATE ORDER =====
app.post("/api/orders", (req, res) => {
    const order = req.body;

    const sql = "INSERT INTO orders SET ?";

    db.query(sql, order, (err, result) => {
        if (err) return res.json(err);
        res.json({ message: "Order saved", result });
    });
});

// ===== GET ORDERS =====
app.get("/api/orders", (req, res) => {
    db.query("SELECT * FROM orders", (err, result) => {
        if (err) return res.json(err);
        res.json(result);
    });
});

// ===== UPDATE STATUS =====
app.put("/api/orders/:id", (req, res) => {
    const { status } = req.body;

    db.query(
        "UPDATE orders SET status=? WHERE id=?",
        [status, req.params.id],
        (err, result) => {
            if (err) return res.json(err);
            res.json(result);
        }
    );
});

// ===== DELETE ORDER =====
app.delete("/api/orders/:id", (req, res) => {
    db.query(
        "DELETE FROM orders WHERE id=?",
        [req.params.id],
        (err, result) => {
            if (err) return res.json(err);
            res.json(result);
        }
    );
});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});