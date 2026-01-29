import db from "../config/db.js";

const runQuery = (sql) => {
  return new Promise((resolve, reject) => {
    db.query(sql, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

const getDashboardData = async (req, res) => {
  try {
    const [q1, q2, q3, q4, q5, q6, q7, q8, q9, q10] = await Promise.all([
      // 1. Produk Terlaris Tahun Sebelumnya
      runQuery(`
        SELECT * FROM (
          SELECT 
            (SELECT product_name FROM products WHERE product_id = od.product_id) AS nama_produk, 
            SUM(QTY) AS jumlah
          FROM order_details od
          WHERE (SELECT YEAR(order_date) FROM orders WHERE order_id = od.order_id) = YEAR(CURDATE()) - 1
          GROUP BY od.product_id
        ) AS rekap
        WHERE jumlah = (
          SELECT MAX(total_qty) 
          FROM (
            SELECT SUM(QTY) AS total_qty 
            FROM order_details od2
            WHERE (SELECT YEAR(order_date) FROM orders WHERE order_id = od2.order_id) = YEAR(CURDATE()) - 1
            GROUP BY od2.product_id
          ) AS tabel_bantu
        );`),

      // 2. Customer Paling Banyak Order Tahun Sebelumnya
      runQuery(`
        SELECT * FROM (
          SELECT 
            (SELECT cust_name FROM customers WHERE cust_id = o.cust_id) AS cust_name, 
            COUNT(o.order_id) AS jumlah
          FROM orders o
          WHERE YEAR(o.order_date) = YEAR(CURDATE()) - 1
          GROUP BY o.cust_id
        ) AS hasil_rekap
        WHERE jumlah = (
          SELECT MAX(total_order) 
          FROM (
            SELECT COUNT(order_id) AS total_order 
            FROM orders 
            WHERE YEAR(order_date) = YEAR(CURDATE()) - 1 
            GROUP BY cust_id
          ) AS sub_hitung
        )`),

      // 3. Customer dengan Nominal Belanja Terbesar Tahun Sebelumnya
      runQuery(`
        SELECT * FROM (
          SELECT 
            (SELECT cust_name FROM customers WHERE cust_id = (SELECT cust_id FROM orders WHERE order_id = od.order_id)) AS nama_pelanggan, 
            SUM(price * QTY) AS nominal 
          FROM order_details od 
          WHERE (SELECT YEAR(order_date) FROM orders WHERE order_id = od.order_id) = YEAR(CURDATE()) - 1 
          GROUP BY nama_pelanggan
        ) AS rekap 
        WHERE nominal = (
          SELECT MAX(total_nominal) 
          FROM (
            SELECT SUM(price * QTY) AS total_nominal 
            FROM order_details od2 
            WHERE (SELECT YEAR(order_date) FROM orders WHERE order_id = od2.order_id) = YEAR(CURDATE()) - 1 
            GROUP BY (SELECT cust_id FROM orders WHERE order_id = od2.order_id)
          ) AS tabel_bantu
        )`),

      // 4. Customer dengan Total Item Terbanyak Tahun Sebelumnya
      runQuery(`
        SELECT * FROM (
          SELECT 
            (SELECT cust_name FROM customers WHERE cust_id = (SELECT cust_id FROM orders WHERE order_id = od.order_id)) AS nama_pelanggan, 
            SUM(QTY) AS total_item 
          FROM order_details od 
          WHERE (SELECT YEAR(order_date) FROM orders WHERE order_id = od.order_id) = YEAR(CURDATE()) - 1 
          GROUP BY nama_pelanggan
        ) AS rekap 
        WHERE total_item = (
          SELECT MAX(total_quantity) 
          FROM (
            SELECT SUM(QTY) AS total_quantity 
            FROM order_details od2 
            WHERE (SELECT YEAR(order_date) FROM orders WHERE order_id = od2.order_id) = YEAR(CURDATE()) - 1 
            GROUP BY (SELECT cust_id FROM orders WHERE order_id = od2.order_id)
          ) AS tabel_bantu
        )`),

      // 5. 10 Produk Terlaris Tahun Sebelumnya
      runQuery(`
        SELECT p.product_name AS nama_produk, SUM(od.qty) AS jumlah
        FROM order_details od INNER JOIN orders o ON od.order_id = o.order_id
        JOIN products p ON p.product_id = od.product_id
        WHERE YEAR(o.order_date) = YEAR(CURDATE()) - 1
        GROUP BY p.product_name ORDER BY jumlah DESC LIMIT 10`),

      // 6. Profit Penjualan Bulanan Per Produk Tahun Sebelumnya
      runQuery(`
        SELECT product_name,
    SUM(CASE WHEN bulan = 1  THEN subtotal ELSE 0 END) AS Jan,
    SUM(CASE WHEN bulan = 2  THEN subtotal ELSE 0 END) AS Feb,
    SUM(CASE WHEN bulan = 3  THEN subtotal ELSE 0 END) AS Mar,
    SUM(CASE WHEN bulan = 4  THEN subtotal ELSE 0 END) AS Apr,
    SUM(CASE WHEN bulan = 5  THEN subtotal ELSE 0 END) AS Mei,
    SUM(CASE WHEN bulan = 6  THEN subtotal ELSE 0 END) AS Jun,
    SUM(CASE WHEN bulan = 7  THEN subtotal ELSE 0 END) AS Jul,
    SUM(CASE WHEN bulan = 8  THEN subtotal ELSE 0 END) AS Agt,
    SUM(CASE WHEN bulan = 9  THEN subtotal ELSE 0 END) AS Sep,
    SUM(CASE WHEN bulan = 10 THEN subtotal ELSE 0 END) AS Okt,
    SUM(CASE WHEN bulan = 11 THEN subtotal ELSE 0 END) AS Nov,
    SUM(CASE WHEN bulan = 12 THEN subtotal ELSE 0 END) AS Des
    FROM (
    SELECT p.product_name,
    MONTH(o.order_date) AS bulan,
    od.qty * od.price AS subtotal
    FROM order_details od
    JOIN orders o ON o.order_id = od.order_id
    JOIN products p ON p.product_id = od.product_id
    WHERE YEAR(o.order_date) = YEAR(CURDATE()) - 1
    ) t
    GROUP BY product_name
    ORDER BY product_name;`),

      // 7. Jumlah Penjualan Bulanan Per Produk Tahun Sebelumnya
      runQuery(`
        SELECT product_name,
    SUM(CASE WHEN bulan = 1  THEN qty ELSE 0 END) AS Jan,
    SUM(CASE WHEN bulan = 2  THEN qty ELSE 0 END) AS Feb,
    SUM(CASE WHEN bulan = 3  THEN qty ELSE 0 END) AS Mar,
    SUM(CASE WHEN bulan = 4  THEN qty ELSE 0 END) AS Apr,
    SUM(CASE WHEN bulan = 5  THEN qty ELSE 0 END) AS Mei,
    SUM(CASE WHEN bulan = 6  THEN qty ELSE 0 END) AS Jun,
    SUM(CASE WHEN bulan = 7  THEN qty ELSE 0 END) AS Jul,
    SUM(CASE WHEN bulan = 8  THEN qty ELSE 0 END) AS Agt,
    SUM(CASE WHEN bulan = 9  THEN qty ELSE 0 END) AS Sep,
    SUM(CASE WHEN bulan = 10 THEN qty ELSE 0 END) AS Okt,
    SUM(CASE WHEN bulan = 11 THEN qty ELSE 0 END) AS Nov,
    SUM(CASE WHEN bulan = 12 THEN qty ELSE 0 END) AS Des
    FROM (
    SELECT p.product_name,
    MONTH(o.order_date) AS bulan,
    od.qty
    FROM order_details od
    JOIN orders o ON o.order_id = od.order_id
    JOIN products p ON p.product_id = od.product_id
    WHERE YEAR(o.order_date) = YEAR(CURDATE()) - 1
    ) t
    GROUP BY product_name
    ORDER BY product_name;`),

      // 8. Jumlah Order Bulanan Per Customer Tahun Sebelumnya
      runQuery(`
         SELECT c.cust_name,
          SUM(CASE WHEN MONTH(o.order_date)=1 THEN 1 ELSE 0 END) AS Januari,
          SUM(CASE WHEN MONTH(o.order_date)=2 THEN 1 ELSE 0 END) AS Februari,
          SUM(CASE WHEN MONTH(o.order_date)=3 THEN 1 ELSE 0 END) AS Maret,
          SUM(CASE WHEN MONTH(o.order_date)=4 THEN 1 ELSE 0 END) AS April,
          SUM(CASE WHEN MONTH(o.order_date)=5 THEN 1 ELSE 0 END) AS Mei,
          SUM(CASE WHEN MONTH(o.order_date)=6 THEN 1 ELSE 0 END) AS Juni,
          SUM(CASE WHEN MONTH(o.order_date)=7 THEN 1 ELSE 0 END) AS Juli,
          SUM(CASE WHEN MONTH(o.order_date)=8 THEN 1 ELSE 0 END) AS Agustus,
          SUM(CASE WHEN MONTH(o.order_date)=9 THEN 1 ELSE 0 END) AS September,
          SUM(CASE WHEN MONTH(o.order_date)=10 THEN 1 ELSE 0 END) AS Oktober,
          SUM(CASE WHEN MONTH(o.order_date)=11 THEN 1 ELSE 0 END) AS November,
          SUM(CASE WHEN MONTH(o.order_date)=12 THEN 1 ELSE 0 END) AS Desember
        FROM customers c
        NATURAL JOIN orders o
        WHERE YEAR(o.order_date) = YEAR(CURDATE()) - 1
        GROUP BY c.cust_id, c.cust_name
        ORDER BY c.cust_name;`),

      // 9. Total Nominal Order Bulanan Per Customer Tahun Sebelumnya
      runQuery(`
        SELECT c.cust_name,
        SUM(CASE WHEN MONTH(o.order_date)=1 THEN od.qty*od.price ELSE 0 END) AS Januari,
        SUM(CASE WHEN MONTH(o.order_date)=2 THEN od.qty*od.price ELSE 0 END) AS Februari,
        SUM(CASE WHEN MONTH(o.order_date)=3 THEN od.qty*od.price ELSE 0 END) AS Maret,
        SUM(CASE WHEN MONTH(o.order_date)=4 THEN od.qty*od.price ELSE 0 END) AS April,
        SUM(CASE WHEN MONTH(o.order_date)=5 THEN od.qty*od.price ELSE 0 END) AS Mei,
        SUM(CASE WHEN MONTH(o.order_date)=6 THEN od.qty*od.price ELSE 0 END) AS Juni,
        SUM(CASE WHEN MONTH(o.order_date)=7 THEN od.qty*od.price ELSE 0 END) AS Juli,
        SUM(CASE WHEN MONTH(o.order_date)=8 THEN od.qty*od.price ELSE 0 END) AS Agustus,
        SUM(CASE WHEN MONTH(o.order_date)=9 THEN od.qty*od.price ELSE 0 END) AS September,
        SUM(CASE WHEN MONTH(o.order_date)=10 THEN od.qty*od.price ELSE 0 END) AS Oktober,
        SUM(CASE WHEN MONTH(o.order_date)=11 THEN od.qty*od.price ELSE 0 END) AS November,
        SUM(CASE WHEN MONTH(o.order_date)=12 THEN od.qty*od.price ELSE 0 END) AS Desember
      FROM customers c
      NATURAL JOIN orders o
      NATURAL JOIN order_details od
      WHERE YEAR(o.order_date)=YEAR(CURDATE())-1
      GROUP BY c.cust_id, c.cust_name
      ORDER BY c.cust_name;
    `),

      // 10. Jumlah Layanan Bulanan Per Kasir Tahun Sebelumnya
      runQuery(`
        SELECT c.USERNAME,
        SUM(CASE WHEN MONTH(o.order_date)=1 THEN 1 ELSE 0 END) AS Januari,
        SUM(CASE WHEN MONTH(o.order_date)=2 THEN 1 ELSE 0 END) AS Februari,
        SUM(CASE WHEN MONTH(o.order_date)=3 THEN 1 ELSE 0 END) AS Maret,
        SUM(CASE WHEN MONTH(o.order_date)=4 THEN 1 ELSE 0 END) AS April,
        SUM(CASE WHEN MONTH(o.order_date)=5 THEN 1 ELSE 0 END) AS Mei,                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    
        SUM(CASE WHEN MONTH(o.order_date)=6 THEN 1 ELSE 0 END) AS Juni,
        SUM(CASE WHEN MONTH(o.order_date)=7 THEN 1 ELSE 0 END) AS Juli,
        SUM(CASE WHEN MONTH(o.order_date)=8 THEN 1 ELSE 0 END) AS Agustus,
        SUM(CASE WHEN MONTH(o.order_date)=9 THEN 1 ELSE 0 END) AS September,
        SUM(CASE WHEN MONTH(o.order_date)=10 THEN 1 ELSE 0 END) AS Oktober,
        SUM(CASE WHEN MONTH(o.order_date)=11 THEN 1 ELSE 0 END) AS November,
        SUM(CASE WHEN MONTH(o.order_date)=12 THEN 1 ELSE 0 END) AS Desember
      FROM cashiers c
      NATURAL JOIN orders o
      WHERE YEAR(o.order_date)=YEAR(CURDATE())-1
      GROUP BY c.USER_ID, c.USERNAME;`),
    ]);

    res.status(200).json({ q1, q2, q3, q4, q5, q6, q7, q8, q9, q10 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export default getDashboardData;
