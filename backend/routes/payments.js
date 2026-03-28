const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middlewares/authMiddleware');
const { processPayment, getPaymentByBooking } = require('../controllers/paymentController');

router.post('/', verifyToken, processPayment);
router.get('/:booking_id', verifyToken, getPaymentByBooking);

module.exports = router;
