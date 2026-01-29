import db from "../config/db.js";

// GET ALL CUSTOMERS
export const getCustomers = (req, res) => {
  db.query("SELECT * FROM customers", (err, results) => {
    if (err) return res.status(500).json({ message: err.message });
    res.status(200).json(results);
  });
};

// GET CUSTOMER BY ID (Penting untuk Halaman Edit)
export const getCustomerById = (req, res) => {
  const { id } = req.params;
  db.query(
    "SELECT * FROM customers WHERE CUST_ID = ?",
    [id],
    (err, results) => {
      if (err) return res.status(500).json({ message: err.message });
      if (results.length === 0)
        return res.status(404).json({ message: "Data tidak ditemukan" });
      res.json(results[0]);
    },
  );
};

// INSERT CUSTOMER
export const insertCustomer = (req, res) => {
  const {
    CUST_ID,
    CUST_NAME,
    ADDRESS,
    PLACE_OF_BIRTH,
    DATE_OF_BIRTH,
    CONTACT_NUMBER,
    EMAIL,
    GENDER_ID,
  } = req.body;

  const sql = `INSERT INTO customers 
    (CUST_ID, CUST_NAME, ADDRESS, PLACE_OF_BIRTH, DATE_OF_BIRTH, CONTACT_NUMBER, EMAIL, GENDER_ID, CREATED_BY) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  db.query(
    sql,
    [
      CUST_ID,
      CUST_NAME,
      ADDRESS,
      PLACE_OF_BIRTH,
      DATE_OF_BIRTH,
      CONTACT_NUMBER,
      EMAIL,
      GENDER_ID,
      "ADMIN",
    ],
    (err, results) => {
      if (err) return res.status(500).json({ message: err.message });
      res.status(201).json({ message: "Customer berhasil ditambahkan" });
    },
  );
};

// UPDATE CUSTOMER
export const updateCustomer = (req, res) => {
  const { id } = req.params; // Mengambil CUST_ID dari URL
  const {
    CUST_NAME,
    ADDRESS,
    PLACE_OF_BIRTH,
    DATE_OF_BIRTH,
    CONTACT_NUMBER,
    EMAIL,
    GENDER_ID, // Pastikan ini ditangkap!
  } = req.body;

  const sql = `UPDATE customers SET 
    CUST_NAME = ?, 
    ADDRESS = ?, 
    PLACE_OF_BIRTH = ?, 
    DATE_OF_BIRTH = ?, 
    CONTACT_NUMBER = ?, 
    EMAIL = ?, 
    GENDER_ID = ?, 
    UPDATED_BY = ? 
    WHERE CUST_ID = ?`;

  db.query(
    sql,
    [
      CUST_NAME,
      ADDRESS,
      PLACE_OF_BIRTH,
      DATE_OF_BIRTH,
      CONTACT_NUMBER,
      EMAIL,
      GENDER_ID,
      "ADMIN",
      id,
    ],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: err.message });
      }
      res.json({ message: "Customer berhasil diperbarui" });
    },
  );
};

// DELETE CUSTOMER
export const deleteCustomer = (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM customers WHERE CUST_ID = ?", [id], (err) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json({ message: "Customer berhasil dihapus" });
  });
};
