import db from "../config/db.js";

// 1. GET ALL ORDERS
export const getOrders = (req, res) => {
  const sql = `SELECT o.*, c.CUST_NAME FROM orders o 
               LEFT JOIN customers c ON o.CUST_ID = c.CUST_ID 
               ORDER BY o.ORDER_DATE DESC`;
  db.query(sql, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
};

// 2. GET ORDER BY ID
export const getOrderById = (req, res) => {
  const sqlH = "SELECT * FROM orders WHERE ORDER_ID = ?";
  const sqlD = `SELECT od.*, p.PRODUCT_NAME FROM order_details od 
                JOIN products p ON od.PRODUCT_ID = p.PRODUCT_ID 
                WHERE od.ORDER_ID = ?`;

  db.query(sqlH, [req.params.id], (err, header) => {
    if (err) return res.status(500).json(err);
    db.query(sqlD, [req.params.id], (err, details) => {
      if (err) return res.status(500).json(err);
      res.json({ ...header[0], items: details });
    });
  });
};
// CREATE ORDER (Add Transaction)
export const createOrder = (req, res) => {
  const {
    ORDER_ID,
    CUST_ID,
    USER_ID,
    TOTAL,
    METHOD_ID,
    RECEIPT_NUMBER,
    items,
  } = req.body;

  db.beginTransaction((err) => {
    if (err)
      return res.status(500).json({ message: "Gagal transaksi", error: err });

    // 1. Simpan ke tabel orders
    const sqlH = `INSERT INTO orders (ORDER_ID, ORDER_DATE, CUST_ID, USER_ID, TOTAL, METHOD_ID, RECEIPT_NUMBER) VALUES (?, NOW(), ?, ?, ?, ?, ?)`;
    db.query(
      sqlH,
      [ORDER_ID, CUST_ID, USER_ID, TOTAL, METHOD_ID, RECEIPT_NUMBER],
      (err) => {
        if (err)
          return db.rollback(() =>
            res.status(500).json({ message: "Error Header", error: err }),
          );

        // 2. Simpan ke order_details (HANYA kolom yang ada di DB: ORDER_ID, PRODUCT_ID, QTY, PRICE)
        const sqlD = `INSERT INTO order_details (ORDER_ID, PRODUCT_ID, QTY, PRICE) VALUES ?`;
        const values = items.map((i) => [
          ORDER_ID,
          i.PRODUCT_ID,
          i.QTY,
          i.PRICE,
        ]);

        db.query(sqlD, [values], (err) => {
          if (err)
            return db.rollback(() =>
              res.status(500).json({ message: "Error Detail", error: err }),
            );

          db.commit((err) => {
            if (err) return db.rollback(() => res.status(500).json(err));
            res.json({ message: "Berhasil Simpan Transaksi" });
          });
        });
      },
    );
  });
};

// UPDATE ORDER (Edit Transaction)
export const updateOrder = (req, res) => {
  const { id } = req.params;
  const { CUST_ID, TOTAL, RECEIPT_NUMBER, items } = req.body;

  db.beginTransaction((err) => {
    if (err) return res.status(500).json(err);

    // 1. Update Header di tabel orders
    const sqlUpdateH = `UPDATE orders SET CUST_ID = ?, TOTAL = ?, RECEIPT_NUMBER = ? WHERE ORDER_ID = ?`;

    db.query(sqlUpdateH, [CUST_ID, TOTAL, RECEIPT_NUMBER, id], (err) => {
      if (err) return db.rollback(() => res.status(500).json(err));

      // 2. Hapus detail lama agar tidak duplikat saat insert baru
      db.query("DELETE FROM order_details WHERE ORDER_ID = ?", [id], (err) => {
        if (err) return db.rollback(() => res.status(500).json(err));

        // 3. Masukkan kembali detail produk yang baru (Tanpa kolom SUBTOTAL)
        const sqlInsertD = `INSERT INTO order_details (ORDER_ID, PRODUCT_ID, QTY, PRICE) VALUES ?`;
        const values = items.map((i) => [id, i.PRODUCT_ID, i.QTY, i.PRICE]);

        db.query(sqlInsertD, [values], (err) => {
          if (err) return db.rollback(() => res.status(500).json(err));

          db.commit((err) => {
            if (err) return db.rollback(() => res.status(500).json(err));
            res.json({ message: "Berhasil Update Transaksi" });
          });
        });
      });
    });
  });
};

// 5. DELETE ORDER
export const deleteOrder = (req, res) => {
  db.query(
    "DELETE FROM order_details WHERE ORDER_ID = ?",
    [req.params.id],
    (err) => {
      if (err) return res.status(500).json(err);

      db.query(
        "DELETE FROM orders WHERE ORDER_ID = ?",
        [req.params.id],
        (err) => {
          if (err) return res.status(500).json(err);
          res.json({ message: "Berhasil Hapus Transaksi" });
        },
      );
    },
  );
};
