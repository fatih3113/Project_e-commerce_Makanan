import mysql from 'mysql2';
import dotenv from 'dotenv';

dotenv.config();

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});
// Menghubungkan ke database
db.connect((error) => {
    if (error) {
        console.error('Eror koneksi database:', error);
        return;
    }

    // Jika Tidak Ada Error
    console.log('MYSQL berhasil connect');
});

export default db;