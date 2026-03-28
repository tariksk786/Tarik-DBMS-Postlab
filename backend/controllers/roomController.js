const db = require('../config/db');

// Get all rooms for a hotel
exports.getRoomsByHotel = async (req, res) => {
    try {
        const { hotel_id } = req.params;
        const [rooms] = await db.query('SELECT * FROM rooms WHERE hotel_id = ?', [hotel_id]);
        res.json(rooms);
    } catch (err) {
        res.status(500).json({ error: 'Error fetching rooms' });
    }
};

// Check availability of a specific room for given dates
exports.checkAvailability = async (req, res) => {
    try {
        const { room_id } = req.params;
        const { check_in_date, check_out_date } = req.query;

        if (!check_in_date || !check_out_date) {
            return res.status(400).json({ error: 'Please provide check_in_date and check_out_date' });
        }

        // A room is unavailable if there's any active (non-cancelled) booking where dates overlap
        const [conflict] = await db.query(`
            SELECT id FROM bookings
            WHERE room_id = ?
              AND status != 'Cancelled'
              AND check_in_date < ?
              AND check_out_date > ?
        `, [room_id, check_out_date, check_in_date]);

        if (conflict.length > 0) {
            return res.json({ available: false, message: 'Room is not available for selected dates.' });
        }

        res.json({ available: true, message: 'Room is available!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error checking availability' });
    }
};

// Admin: Add a room to a hotel
exports.createRoom = async (req, res) => {
    try {
        const { hotel_id, room_type, price_per_night, capacity } = req.body;
        if (!hotel_id || !room_type || !price_per_night) {
            return res.status(400).json({ error: 'hotel_id, room_type and price_per_night are required' });
        }
        const [result] = await db.query(
            'INSERT INTO rooms (hotel_id, room_type, price_per_night, capacity) VALUES (?, ?, ?, ?)',
            [hotel_id, room_type, price_per_night, capacity || 2]
        );
        res.status(201).json({ message: 'Room created', roomId: result.insertId });
    } catch (err) {
        res.status(500).json({ error: 'Error creating room' });
    }
};

// Admin: Update a room
exports.updateRoom = async (req, res) => {
    try {
        const { id } = req.params;
        const { room_type, price_per_night, capacity } = req.body;
        await db.query(
            'UPDATE rooms SET room_type=?, price_per_night=?, capacity=? WHERE id=?',
            [room_type, price_per_night, capacity, id]
        );
        res.json({ message: 'Room updated' });
    } catch (err) {
        res.status(500).json({ error: 'Error updating room' });
    }
};

// Admin: Delete a room
exports.deleteRoom = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM rooms WHERE id = ?', [id]);
        res.json({ message: 'Room deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Error deleting room' });
    }
};
