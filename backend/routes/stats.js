const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');
const { auth, adminAuth } = require('../middleware/auth');

router.get('/dashboard', auth, adminAuth, statsController.getDashboardStats);

module.exports = router;

