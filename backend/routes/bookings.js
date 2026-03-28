const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middlewares/authMiddleware');
const {
    createBooking,
    getMyBookings,
    cancelBooking,
    getAllBookings,
    confirmBooking
} = require('../controllers/bookingController');

// User routes (authenticated)
router.post('/', verifyToken, createBooking);
router.get('/my-bookings', verifyToken, getMyBookings);
router.put('/:id/cancel', verifyToken, cancelBooking);

// Admin routes
router.get('/all', verifyToken, isAdmin, getAllBookings);
router.put('/:id/confirm', verifyToken, isAdmin, confirmBooking);

module.exports = router;
