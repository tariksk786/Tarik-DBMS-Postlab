const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middlewares/authMiddleware');
const { getDashboardStats, getAllUsers, deleteUser } = require('../controllers/adminController');
const { getAllBookings, confirmBooking } = require('../controllers/bookingController');

// All admin routes are protected
router.get('/stats', verifyToken, isAdmin, getDashboardStats);
router.get('/users', verifyToken, isAdmin, getAllUsers);
router.delete('/users/:id', verifyToken, isAdmin, deleteUser);
router.get('/bookings', verifyToken, isAdmin, getAllBookings);
router.put('/bookings/:id/confirm', verifyToken, isAdmin, confirmBooking);

module.exports = router;
