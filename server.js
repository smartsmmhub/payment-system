const express = require("express");
const multer = require("multer");
const fs = require("fs");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

const upload = multer({ dest: "uploads/" });

let db = { payments: [] };

app.post("/api/submit", upload.single("screenshot"), (req, res) => {
  const { username, amount, txn } = req.body;

  if (db.payments.find(p => p.txn === txn)) {
    return res.send("Duplicate Transaction ID!");
  }

  const payment = {
    id: Date.now(),
    username,
    amount,
    txn,
    file: req.file.filename,
    status: "pending",
    time: new Date()
  };

  db.payments.push(payment);
  res.send("Payment submitted successfully!");
});

app.get("/api/payments", (req, res) => {
  res.json(db.payments);
});

app.listen(process.env.PORT || 3000);
