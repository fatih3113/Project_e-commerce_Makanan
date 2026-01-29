import db from "../config/db.js";

// GET ALL
export const getProductCategories = (req, res) => {
  db.query("SELECT * FROM product_categories", (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
};

// GET BY ID
export const getProductCategoryById = (req, res) => {
  db.query(
    "SELECT * FROM product_categories WHERE CATEGORY_ID = ?",
    [req.params.id],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json(result[0]);
    },
  );
};

// CREATE
export const createProductCategory = (req, res) => {
  const { CATEGORY_ID, CATEGORY } = req.body;
  db.query(
    "INSERT INTO product_categories (CATEGORY_ID, CATEGORY) VALUES (?, ?)",
    [CATEGORY_ID, CATEGORY],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Category created" });
    },
  );
};

// UPDATE
// UPDATE CATEGORY (Termasuk ID)
export const updateProductCategory = (req, res) => {
  const { id } = req.params; // ID lama dari URL
  const { CATEGORY, newId } = req.body; // ID baru dan Nama dari Form

  const sql =
    "UPDATE product_categories SET CATEGORY_ID = ?, CATEGORY = ? WHERE CATEGORY_ID = ?";

  db.query(sql, [newId || id, CATEGORY, id], (err) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json({ message: "Category updated successfully" });
  });
};

export const deleteProductCategory = (req, res) => {
  const { id } = req.params;
  db.query(
    "DELETE FROM product_categories WHERE CATEGORY_ID = ?",
    [id],
    (err, result) => {
      if (err) {
        if (err.errno === 1451) {
          return res.status(400).json({
            message:
              "Kategori tidak bisa dihapus karena masih digunakan oleh data produk.",
          });
        }
        return res.status(500).json({ message: "Terjadi kesalahan server." });
      }
      res.json({ message: "Kategori berhasil dihapus" });
    },
  );
};
