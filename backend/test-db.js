const mysql = require('mysql2/promise');
require('dotenv').config();

async function test() {
    console.log('--- DB Connection Test ---');
    console.log('Host:', process.env.DB_HOST);
    console.log('User:', process.env.DB_USER);
    console.log('Database:', process.env.DB_NAME);
    
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: 3306
        });
        console.log('✅ Connection Successful!');
        
        const [rows] = await connection.execute('SELECT VERSION() as version');
        console.log('MySQL Version:', rows[0].version);
        
        await connection.end();
    } catch (err) {
        console.error('❌ Connection Failed!');
        console.error('Error Code:', err.code);
        console.error('Error No:', err.errno);
        console.error('SQL State:', err.sqlState);
        console.error('Full Message:', err.message);
    }
}
test();
