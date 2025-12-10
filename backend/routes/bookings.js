const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { auth, adminAuth } = require('../middleware/auth');
const { bookingRateLimiter } = require('../middleware/rateLimiter');

// User routes
router.post('/', auth, bookingRateLimiter, bookingController.createBooking);
router.get('/user', auth, bookingController.getUserBookings);
router.patch('/:id/cancel', auth, bookingController.cancelBooking);

// Admin routes
router.get('/admin', auth, adminAuth, bookingController.getAllBookings);

module.exports = router;

