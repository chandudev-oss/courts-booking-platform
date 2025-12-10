const express = require('express');
const router = express.Router();
const pricingRuleController = require('../controllers/pricingRuleController');
const { auth, adminAuth } = require('../middleware/auth');

// Public routes
router.get('/', pricingRuleController.getAllPricingRules);
router.get('/:id', pricingRuleController.getPricingRuleById);

// Admin routes - mounted at /admin/pricing-rules in server.js
const adminRouter = express.Router();
adminRouter.use(auth, adminAuth);
adminRouter.post('/', pricingRuleController.createPricingRule);
adminRouter.patch('/:id', pricingRuleController.updatePricingRule);
adminRouter.delete('/:id', pricingRuleController.deletePricingRule);

module.exports = { public: router, admin: adminRouter };

