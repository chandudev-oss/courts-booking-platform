const express = require('express');
const router = express.Router();
const courtController = require('../controllers/courtController');
const { auth, adminAuth } = require('../middleware/auth');

// Public routes
router.get('/', courtController.getAllCourts);
router.get('/:id', courtController.getCourtById);

// Admin routes - mounted at /admin/courts in server.js
const adminRouter = express.Router();
adminRouter.use(auth, adminAuth);
adminRouter.get('/', courtController.getAllCourts); // Admin gets all courts including inactive
adminRouter.post('/', courtController.createCourt);
adminRouter.patch('/:id', courtController.updateCourt);
adminRouter.delete('/:id', courtController.deleteCourt);

module.exports = { public: router, admin: adminRouter };

