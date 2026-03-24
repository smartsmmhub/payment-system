const express = require("express");
const multer = require("multer");
const fs = require("fs");

const app = express();

/* MIDDLEWARE */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

/* FILE UPLOAD */
const upload = multer({ dest: "uploads/" });

/* SIMPLE IN-MEMORY DATABASE */
let db = {
  payments: []
};

/* =========================
   SUBMIT PAYMENT
========================= */
app.post("/api/submit", upload.single("screenshot"), (req, res) => {
  const { username, amount, txn } = req.body;

  if (!username || !amount || !txn) {
    return res.status(400).send("Missing fields");
  }

  // prevent duplicate txn
  const exists = db.payments.find(p => p.txn === txn);
  if (exists) {
    return res.send("Duplicate transaction ID");
  }

  const payment = {
    id: Date.now(),
    username,
    amount,
    txn,
    status: "pending",
    file: req.file ? req.file.filename : null,
    time: new Date()
  };

  db.payments.push(payment);

  res.send("Payment submitted successfully");
});


/* =========================
   GET ALL PAYMENTS (ADMIN)
========================= */
app.get("/api/payments", (req, res) => {
  res.json(db.payments);
});


/* =========================
   UPDATE STATUS (APPROVE / REJECT)
========================= */
app.post("/api/update-status", (req, res) => {
  const { id, status } = req.body;

  const payment = db.payments.find(p => p.id == id);

  if (!payment) {
    return res.status(404).send("Payment not found");
  }

  payment.status = status;

  res.send("Status updated successfully");
});


/* =========================
   START SERVER
========================= */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
