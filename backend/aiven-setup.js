const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function setup() {
    console.log('🚀 Starting Aiven Database Setup...');
    
    // Get argument from command line
    const arg = process.argv[2];
    if (!arg) {
        console.error('❌ Error: No password or URI provided.');
        console.log('Use: node aiven-setup.js "YOUR_AIVEN_URI"');
        return;
    }

    let connectionConfig;

    if (arg.startsWith('mysql://')) {
        // Use the connection string directly
        // We strip the ? part to handle it manually or just pass it
        connectionConfig = arg;
        console.log('🔗 Using full connection URI...');
    } else {
        // Use hardcoded config with provided password
        connectionConfig = {
            host: 'mysql-262e8358-skt872074-2fc.b.aivencloud.com', // Using 'e' which appears in URI
            user: 'avnadmin',
            port: 14308,
            database: 'defaultdb',
            password: arg,
            ssl: { rejectUnauthorized: false }
        };
        console.log('🔑 Using password with default host config...');
    }

    let connection;
    try {
        // Connect to Aiven
        connection = await mysql.createConnection(connectionConfig);
        console.log('✅ Connected to Aiven MySQL Service!');

        // Read the SQL file
        const sqlPath = path.join(__dirname, '../database.sql');
        let sqlContent = fs.readFileSync(sqlPath, 'utf8');
        
        // Strip database creation logic as Aiven provides 'defaultdb'
        // Also normalize line endings
        sqlContent = sqlContent.replace(/CREATE DATABASE IF NOT EXISTS.*;/gi, '');
        sqlContent = sqlContent.replace(/USE .*; /gi, '');

        // Split SQL into statements cautiously
        const statements = sqlContent
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 5); // Avoid tiny empty statements

        console.log(`📦 Found ${statements.length} SQL statements. Executing...`);

        // Execute each statement
        for (let i = 0; i < statements.length; i++) {
            try {
                await connection.query(statements[i]);
                if (i % 10 === 0) process.stdout.write('.'); // Progress dot
            } catch (err) {
                // Ignore "already exists" errors
                if (!err.message.toLowerCase().includes('already exists')) {
                    console.error(`\n❌ Error in stmt ${i + 1}:`, err.message);
                }
            }
        }

        console.log('\n\n✨ Database Initialization Successful!');
        console.log('🔗 Your Aiven database now has all the tables.');
        console.log('👉 Go to Render and update your DB_HOST to match the one in your URI.');

    } catch (err) {
        console.error('\n❌ Failed to connect:', err.message);
        console.log('\n💡 Possible fixes:');
        console.log('1. Ensure you copied the FULL URI from Aiven (including mysql://)');
        console.log('2. Check your internet connection.');
        console.log('3. Ensure Aiven "IP address allowlist" is still "Open to all".');
    } finally {
        if (connection) await connection.end();
    }
}

setup();
