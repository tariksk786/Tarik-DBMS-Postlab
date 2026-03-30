const mysql = require('mysql2/promise');
const { URL } = require('url');
require('dotenv').config();

let pool;

try {
    const dbUrl = process.env.DATABASE_URL;

    if (dbUrl && dbUrl.startsWith('mysql://')) {
        // 🛠️ Robust URL Parsing (Bypasses any link symbols or typos)
        const parsedUrl = new URL(dbUrl);
        
        pool = mysql.createPool({
            host: parsedUrl.hostname,
            user: parsedUrl.username,
            password: parsedUrl.password,
            database: parsedUrl.pathname.substring(1) || 'defaultdb',
            port: parsedUrl.port || 14308,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0,
            ssl: { rejectUnauthorized: false } // Required for Aiven
        });
        console.log('🔗 Connected using Robust DATABASE_URL Parsing.');
    } else {
        // Fallback to local config
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
        console.log('⚙️ Using local manual DB variables.');
    }
} catch (error) {
    console.error('⚠️ Critical Error during DB Pool initialization:', error.message);
}

// Test the connection
pool.getConnection()
    .then(connection => {
        console.log('✅ Successfully connected to the MySQL database.');
        connection.release();
    })
    .catch(err => {
        console.error('❌ Database connection failed.');
        console.error('Error Details:', err.message);
    });

module.exports = pool;
