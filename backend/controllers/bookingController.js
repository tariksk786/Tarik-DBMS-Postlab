const db = require('../config/db');

// Create a new booking (with availability check)
exports.createBooking = async (req, res) => {
    try {
        const { room_id, check_in_date, check_out_date } = req.body;
        const user_id = req.user.id;

        if (!room_id || !check_in_date || !check_out_date) {
            return res.status(400).json({ error: 'room_id, check_in_date and check_out_date are required.' });
        }

        if (new Date(check_out_date) <= new Date(check_in_date)) {
            return res.status(400).json({ error: 'Check-out date must be after check-in date.' });
        }

        // Check availability (no overlapping active bookings for this room)
        const [conflict] = await db.query(`
            SELECT id FROM bookings
            WHERE room_id = ?
              AND status != 'Cancelled'
              AND check_in_date < ?
              AND check_out_date > ?
        `, [room_id, check_out_date, check_in_date]);

        if (conflict.length > 0) {
            return res.status(409).json({ error: 'Room is not available for the selected dates.' });
        }

        // Get room price
        const [[room]] = await db.query('SELECT price_per_night FROM rooms WHERE id = ?', [room_id]);
        if (!room) return res.status(404).json({ error: 'Room not found.' });

        // Calculate total price
        const nights = Math.ceil((new Date(check_out_date) - new Date(check_in_date)) / (1000 * 60 * 60 * 24));
        const total_price = nights * room.price_per_night;

        // Insert booking
        const [result] = await db.query(
            'INSERT INTO bookings (user_id, room_id, check_in_date, check_out_date, total_price, status) VALUES (?, ?, ?, ?, ?, ?)',
            [user_id, room_id, check_in_date, check_out_date, total_price, 'Pending']
        );

        res.status(201).json({
            message: 'Booking created successfully.',
            bookingId: result.insertId,
            total_price,
            nights
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error creating booking.' });
    }
};

// Get current user's bookings
exports.getMyBookings = async (req, res) => {
    try {
        const user_id = req.user.id;
        const [bookings] = await db.query(`
            SELECT b.*, 
                   r.room_type, r.price_per_night,
                   h.name AS hotel_name, h.location AS hotel_location,
                   p.payment_status, p.payment_method
            FROM bookings b
            JOIN rooms r ON r.id = b.room_id
            JOIN hotels h ON h.id = r.hotel_id
            LEFT JOIN payments p ON p.booking_id = b.id
            WHERE b.user_id = ?
            ORDER BY b.created_at DESC
        `, [user_id]);
        res.json(bookings);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error fetching bookings.' });
    }
};

// Cancel a booking
exports.cancelBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const user_id = req.user.id;

        const [[booking]] = await db.query('SELECT * FROM bookings WHERE id = ? AND user_id = ?', [id, user_id]);
        if (!booking) return res.status(404).json({ error: 'Booking not found.' });
        if (booking.status === 'Cancelled') return res.status(400).json({ error: 'Booking is already cancelled.' });

        await db.query("UPDATE bookings SET status = 'Cancelled' WHERE id = ?", [id]);
        // Also update payment to Failed if exists
        await db.query("UPDATE payments SET payment_status = 'Failed' WHERE booking_id = ?", [id]);

        res.json({ message: 'Booking cancelled successfully.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error cancelling booking.' });
    }
};

// Admin: Get ALL bookings
exports.getAllBookings = async (req, res) => {
    try {
        const [bookings] = await db.query(`
            SELECT b.*, 
                   u.name AS user_name, u.email AS user_email,
                   r.room_type,
                   h.name AS hotel_name,
                   p.payment_status
            FROM bookings b
            JOIN users u ON u.id = b.user_id
            JOIN rooms r ON r.id = b.room_id
            JOIN hotels h ON h.id = r.hotel_id
            LEFT JOIN payments p ON p.booking_id = b.id
            ORDER BY b.created_at DESC
        `);
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ error: 'Error fetching all bookings.' });
    }
};

// Admin: Confirm a booking
exports.confirmBooking = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query("UPDATE bookings SET status = 'Confirmed' WHERE id = ?", [id]);
        res.json({ message: 'Booking confirmed.' });
    } catch (err) {
        res.status(500).json({ error: 'Error confirming booking.' });
    }
};
