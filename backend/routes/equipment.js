const express = require('express');
const router = express.Router();
const equipmentController = require('../controllers/equipmentController');
const { auth, adminAuth } = require('../middleware/auth');

// Public routes
router.get('/', equipmentController.getAllEquipment);
router.get('/:id', equipmentController.getEquipmentById);

// Admin routes - mounted at /admin/equipment in server.js
const adminRouter = express.Router();
adminRouter.use(auth, adminAuth);
adminRouter.post('/', equipmentController.createEquipment);
adminRouter.patch('/:id', equipmentController.updateEquipment);

module.exports = { public: router, admin: adminRouter };

