const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middlewares/authMiddleware');
const {
    getAllHotels,
    getHotelById,
    createHotel,
    updateHotel,
    deleteHotel,
    postReview
} = require('../controllers/hotelController');

// Public routes
router.get('/', getAllHotels);
router.get('/:id', getHotelById);

// Protected user routes
router.post('/:hotel_id/reviews', verifyToken, postReview);

// Admin-only routes
router.post('/', verifyToken, isAdmin, createHotel);
router.put('/:id', verifyToken, isAdmin, updateHotel);
router.delete('/:id', verifyToken, isAdmin, deleteHotel);

module.exports = router;
