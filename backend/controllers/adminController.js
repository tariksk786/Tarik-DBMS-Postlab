const db = require('../config/db');

// Get dashboard stats
exports.getDashboardStats = async (req, res) => {
    try {
        const [[{ totalUsers }]] = await db.query("SELECT COUNT(*) AS totalUsers FROM users WHERE role = 'user'");
        const [[{ totalHotels }]] = await db.query("SELECT COUNT(*) AS totalHotels FROM hotels");
        const [[{ totalBookings }]] = await db.query("SELECT COUNT(*) AS totalBookings FROM bookings");
        const [[{ totalRevenue }]] = await db.query("SELECT IFNULL(SUM(amount), 0) AS totalRevenue FROM payments WHERE payment_status = 'Completed'");

        // Monthly revenue (last 6 months)
        const [monthlyRevenue] = await db.query(`
            SELECT DATE_FORMAT(created_at, '%Y-%m') AS month, SUM(amount) AS revenue
            FROM payments
            WHERE payment_status = 'Completed'
            GROUP BY month
            ORDER BY month DESC
            LIMIT 6
        `);

        // Bookings by status
        const [bookingsByStatus] = await db.query(`
            SELECT status, COUNT(*) AS count FROM bookings GROUP BY status
        `);

        // Top hotels by revenue
        const [topHotels] = await db.query(`
            SELECT h.name, SUM(p.amount) AS revenue
            FROM payments p
            JOIN bookings b ON b.id = p.booking_id
            JOIN rooms r ON r.id = b.room_id
            JOIN hotels h ON h.id = r.hotel_id
            WHERE p.payment_status = 'Completed'
            GROUP BY h.id
            ORDER BY revenue DESC
            LIMIT 5
        `);

        res.json({
            totalUsers, totalHotels, totalBookings,
            totalRevenue: parseFloat(totalRevenue),
            monthlyRevenue: monthlyRevenue.reverse(),
            bookingsByStatus,
            topHotels
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error fetching admin stats.' });
    }
};

// Get all users
exports.getAllUsers = async (req, res) => {
    try {
        const [users] = await db.query("SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC");
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: 'Error fetching users.' });
    }
};

// Delete a user
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM users WHERE id = ?', [id]);
        res.json({ message: 'User deleted.' });
    } catch (err) {
        res.status(500).json({ error: 'Error deleting user.' });
    }
};
