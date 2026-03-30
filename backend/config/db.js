const mysql = require('mysql2/promise');
require('dotenv').config();

let pool;

if (process.env.DATABASE_URL) {
    // If DATABASE_URL is provided, safely append the SSL parameter
    const baseUrl = process.env.DATABASE_URL.trim();
    // Aiven's URI usually has ?ssl-mode=REQUIRED. We append our SSL object properly.
    const separator = baseUrl.includes('?') ? '&' : '?';
    const fullUrl = baseUrl + separator + 'ssl={"rejectUnauthorized":false}';
    
    pool = mysql.createPool(fullUrl);
    console.log('🔗 Using DATABASE_URL for connection.');
} else {
    // Fallback to individual variables for local development
    pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        port: process.env.DB_PORT || 3306,
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'hotel_reservation_db',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : null
    });
    console.log('⚙️ Using individual DB config variables.');
}

// Test the connection
pool.getConnection()
    .then(connection => {
        console.log('✅ Successfully connected to the MySQL database.');
        connection.release();
    })
    .catch(err => {
        console.error('❌ Database connection failed.');
        console.error('Error:', err.message);
    });

module.exports = pool;
