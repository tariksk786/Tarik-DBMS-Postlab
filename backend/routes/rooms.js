const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middlewares/authMiddleware');
const {
    getRoomsByHotel,
    checkAvailability,
    createRoom,
    updateRoom,
    deleteRoom
} = require('../controllers/roomController');

// Public: Get rooms for a hotel
router.get('/hotel/:hotel_id', getRoomsByHotel);

// Public: Check availability
router.get('/:room_id/availability', checkAvailability);

// Admin only
router.post('/', verifyToken, isAdmin, createRoom);
router.put('/:id', verifyToken, isAdmin, updateRoom);
router.delete('/:id', verifyToken, isAdmin, deleteRoom);

module.exports = router;
