const mysql = require('mysql2/promise');
require('dotenv').config();

// Create a connection pool to manage database connections efficiently
const pool = mysql.createPool({
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

// Test the connection
pool.getConnection()
    .then(connection => {
        console.log('✅ Successfully connected to the MySQL database.');
        connection.release(); // release the connection back to the pool
    })
    .catch(err => {
        console.error('❌ Database connection failed. Please make sure MySQL is running.');
        console.error('Error Details:', err.message);
    });

module.exports = pool;
