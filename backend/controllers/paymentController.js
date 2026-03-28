const db = require('../config/db');

// Process a dummy payment for a booking
exports.processPayment = async (req, res) => {
    try {
        const { booking_id, payment_method } = req.body;
        const user_id = req.user.id;

        if (!booking_id || !payment_method) {
            return res.status(400).json({ error: 'booking_id and payment_method are required.' });
        }

        // Validate booking belongs to user and is in Pending state
        const [[booking]] = await db.query(
            'SELECT * FROM bookings WHERE id = ? AND user_id = ?',
            [booking_id, user_id]
        );
        if (!booking) return res.status(404).json({ error: 'Booking not found.' });
        if (booking.status === 'Cancelled') return res.status(400).json({ error: 'Cannot pay for a cancelled booking.' });

        // Check if payment already exists
        const [[existing]] = await db.query('SELECT * FROM payments WHERE booking_id = ?', [booking_id]);
        if (existing && existing.payment_status === 'Completed') {
            return res.status(400).json({ error: 'Payment already completed for this booking.' });
        }

        // Simulate payment processing (always succeeds in demo)
        const payment_status = 'Completed';

        if (existing) {
            // Update existing payment record
            await db.query(
                'UPDATE payments SET payment_method=?, payment_status=? WHERE booking_id=?',
                [payment_method, payment_status, booking_id]
            );
        } else {
            // Insert new payment record
            await db.query(
                'INSERT INTO payments (booking_id, amount, payment_method, payment_status) VALUES (?, ?, ?, ?)',
                [booking_id, booking.total_price, payment_method, payment_status]
            );
        }

        // Auto-confirm the booking after successful payment
        await db.query("UPDATE bookings SET status = 'Confirmed' WHERE id = ?", [booking_id]);

        res.json({
            message: 'Payment processed successfully! Booking confirmed.',
            booking_id,
            amount: booking.total_price,
            payment_status
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error processing payment.' });
    }
};

// Get payment info for a booking
exports.getPaymentByBooking = async (req, res) => {
    try {
        const { booking_id } = req.params;
        const [[payment]] = await db.query('SELECT * FROM payments WHERE booking_id = ?', [booking_id]);
        if (!payment) return res.status(404).json({ error: 'No payment found for this booking.' });
        res.json(payment);
    } catch (err) {
        res.status(500).json({ error: 'Error fetching payment.' });
    }
};
