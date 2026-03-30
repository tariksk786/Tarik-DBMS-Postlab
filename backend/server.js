const express = require('express');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

// Initialize DB connection on startup
const db = require('./config/db.js');

const app = express();

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ─── Serve Static Frontend Files ──────────────────────────────────────────────
app.use(express.static(path.join(__dirname, '../frontend')));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', require('./routes/auth'));
app.use('/api/hotels', require('./routes/hotels'));
app.use('/api/rooms', require('./routes/rooms'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/admin', require('./routes/admin'));

// ─── Health Check & API Info ───────────────────────────────────────────────────
app.get('/api/setup-db', async (req, res) => {
    try {
        const fs = require('fs');
        const sqlPath = path.join(__dirname, '../database.sql');
        let sqlContent = fs.readFileSync(sqlPath, 'utf8');

        sqlContent = sqlContent.replace(/CREATE DATABASE IF NOT EXISTS.*;/gi, '');
        sqlContent = sqlContent.replace(/USE .*; /gi, '');

        const statements = sqlContent.split(';').map(s => s.trim()).filter(s => s.length > 5);

        for (const stmt of statements) {
            try { await db.query(stmt); } catch (e) { /* ignore already exists */ }
        }
        res.json({ message: '✅ Database Setup Successful!' });
    } catch (err) {
        res.status(500).json({ error: 'Setup Failed', details: err.message });
    }
});

app.get('/api/status', (req, res) => {
    res.json({ message: '🏨 Hotel Reservation API is running!', version: '1.0.0' });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
    console.error('Unhandled Error:', err.stack);
    res.status(500).json({ error: 'Something went wrong on the server.' });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`\n🚀 Server running on http://localhost:${PORT}`);
    console.log(`📋 API Endpoints:`);
    console.log(`   POST   /api/auth/register`);
    console.log(`   POST   /api/auth/login`);
    console.log(`   GET    /api/hotels`);
    console.log(`   GET    /api/hotels/:id`);
    console.log(`   GET    /api/rooms/hotel/:hotel_id`);
    console.log(`   GET    /api/rooms/:room_id/availability`);
    console.log(`   POST   /api/bookings`);
    console.log(`   GET    /api/bookings/my-bookings`);
    console.log(`   PUT    /api/bookings/:id/cancel`);
    console.log(`   POST   /api/payments`);
    console.log(`   GET    /api/admin/stats`);
    console.log(`   GET    /api/admin/users`);
    console.log(`   GET    /api/admin/bookings\n`);
});
