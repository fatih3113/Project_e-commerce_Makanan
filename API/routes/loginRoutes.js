import express from "express";
import db from "../config/db.js";

const router = express.Router();

// ini untuk emd point LOGINnnnnn
router.post("/", (req, res) => {
  const { email, password } = req.body;
  const sql =
    "SELECT CUST_ID, CUST_NAME, EMAIL FROM customers WHERE LOWER(EMAIL) = LOWER(?) AND CAST(CUST_ID AS CHAR) = ?";

  db.query(sql, [email.trim(), password.trim()], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length > 0) {
      res.json({ user: results[0] });
    } else {
      res.status(401).send("Email atau password(NIM) salah!");
    }
  });
});


//ini buat untuk end point untuk summit orderan
router.post("/submit-order", (req, res) => {
  const { customer_id, total_amount, items } = req.body;

  // ini buart Membuat Nomor Ressi secaara otomatiss 
  const datePart = new Date()
    .toISOString()
    .replace(/[-T:Z.]/g, "")
    .slice(0, 12);
  const receiptNumber = `${customer_id}${datePart}`;

  const cashierId = 12345678; // Gunakan ID Kasir yang valid

  // ini buatt Tambahkan kolom RECEIPT_NUMBER ke dalam query INSERT
  const sqlOrder = `
    INSERT INTO orders (CUST_ID, USER_ID, TOTAL, METHOD_ID, RECEIPT_NUMBER, ORDER_DATE) 
    VALUES (?, ?, ?, ?, ?, NOW())
  `;

  db.query(
    sqlOrder,
    [customer_id, cashierId, total_amount, 1, receiptNumber],
    (err, result) => {
      if (err) {
        console.error("❌ Error Database Orders:", err.message);
        return res.status(500).json({ error: err.message });
      }

      const orderId = result.insertId;
      const sqlDetails =
        "INSERT INTO order_details (ORDER_ID, PRODUCT_ID, QTY, PRICE) VALUES ?";

      const values = items.map((item) => [
        orderId,
        item.product_id.toString().replace("#", ""),
        item.quantity,
        item.price,
      ]);

      db.query(sqlDetails, [values], (err) => {
        if (err) return res.status(500).json({ error: err.message });

        console.log(
          `✅ Berhasil! Order ID: ${orderId}, Resi: ${receiptNumber}`,
        );
        res.json({ status: "Success", orderId, receiptNumber });
      });
    },
  );
});

export default router;
