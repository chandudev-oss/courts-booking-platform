const express = require('express');
const router = express.Router();
const coachController = require('../controllers/coachController');
const { auth, adminAuth } = require('../middleware/auth');

// Public routes
router.get('/', coachController.getAllCoaches);
router.get('/:id', coachController.getCoachById);

// Admin routes - mounted at /admin/coaches in server.js
const adminRouter = express.Router();
adminRouter.use(auth, adminAuth);
adminRouter.post('/', coachController.createCoach);
adminRouter.patch('/:id', coachController.updateCoach);

module.exports = { public: router, admin: adminRouter };

