import db from "../config/db.js";

// Di productController.js
export const getProducts = (req, res) => {
  const sql = "SELECT * FROM products";
  db.query(sql, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json([]); // <--- Harus Array kosong agar tidak error .map
    }
    res.json(result); 
  });
};

// 2. GET PRODUCT BY ID
export const getProductById = (req, res) => {
  db.query(
    "SELECT * FROM products WHERE PRODUCT_ID = ?",
    [req.params.id],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json(result[0]);
    },
  );
};

// 3. CREATE PRODUCT
export const createProduct = (req, res) => {
  const { PRODUCT_ID, PRODUCT_NAME, PRICE, CATEGORY_ID, STOCK, image_url } = req.body;

  const sql = `
    INSERT INTO products 
    (PRODUCT_ID, PRODUCT_NAME, PRICE, CATEGORY_ID, STOCK, image_url, CREATED_BY, CREATED_AT, UPDATED_BY, UPDATED_AT)
    VALUES (?, ?, ?, ?, ?, ?, 'ADMIN', NOW(), 'ADMIN', NOW())
  `;

  db.query(
    sql,
    [PRODUCT_ID, PRODUCT_NAME, PRICE, CATEGORY_ID, STOCK, image_url],
    (err) => {
      if (err) return res.status(500).json({ message: err.sqlMessage });
      res.json({ message: "Product created successfully" });
    },
  );
};

// 4. UPDATE PRODUCT (Kuncinya di sini!)
export const updateProduct = (req, res) => {
  const { PRODUCT_NAME, PRICE, CATEGORY_ID, STOCK, image_url, newId } = req.body;
  const oldId = req.params.id;

  const sql = `
  UPDATE products SET 
    PRODUCT_ID = ?,
    PRODUCT_NAME = ?,
    PRICE = ?,
    CATEGORY_ID = ?,
    STOCK = ?,
    image_url = IFNULL(NULLIF(?, ''), image_url), -- ini buat pelindung agar si data tidak tertimbun null
    UPDATED_BY = 'KASIR_3A',
    UPDATED_AT = NOW()
  WHERE PRODUCT_ID = ?
`;

  db.query(
    sql,
    [newId || oldId, PRODUCT_NAME, PRICE, CATEGORY_ID, STOCK, image_url, oldId],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Product updated successfully" });
    }
  );
};

// 5. DELETE PRODUCT
export const deleteProduct = (req, res) => {
  db.query(
    "DELETE FROM products WHERE PRODUCT_ID = ?",
    [req.params.id],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Product deleted" });
    },
  );
};