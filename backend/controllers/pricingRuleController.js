const PricingRule = require('../models/PricingRule');
const mongoose = require('mongoose');

const isValidDateString = (value) => /^\d{4}-\d{2}-\d{2}$/.test(value);

exports.getAllPricingRules = async (req, res) => {
  try {
    const rules = await PricingRule.find().sort({ createdAt: -1 });
    res.json(rules);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getPricingRuleById = async (req, res) => {
  try {
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid pricing rule ID format' });
    }
    
    const rule = await PricingRule.findById(req.params.id);
    if (!rule) {
      return res.status(404).json({ message: 'Pricing rule not found' });
    }
    res.json(rule);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createPricingRule = async (req, res) => {
  try {
    const { name, type, condition, value, isActive } = req.body;

    if (condition?.date && !isValidDateString(condition.date)) {
      return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD.' });
    }

    if (condition?.date) {
      const existing = await PricingRule.findOne({ 'condition.date': condition.date });
      if (existing) {
        return res.status(400).json({ message: 'A holiday rule already exists for this date.' });
      }
    }
    
    const rule = new PricingRule({
      name,
      type,
      condition: condition || {},
      value,
      isActive: isActive !== undefined ? isActive : true
    });

    await rule.save();
    res.status(201).json(rule);
  } catch (error) {
    console.error(error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updatePricingRule = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid pricing rule ID format' });
    }
    
    const { name, type, condition, value, isActive } = req.body;

    if (condition?.date && !isValidDateString(condition.date)) {
      return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD.' });
    }
    
    const rule = await PricingRule.findById(req.params.id);
    if (!rule) {
      return res.status(404).json({ message: 'Pricing rule not found' });
    }

    if (name) rule.name = name;
    if (type) rule.type = type;
    if (condition) rule.condition = condition;
    if (value !== undefined) rule.value = value;
    if (isActive !== undefined) rule.isActive = isActive;

    if (rule.condition?.date) {
      const existing = await PricingRule.findOne({
        _id: { $ne: rule._id },
        'condition.date': rule.condition.date
      });
      if (existing) {
        return res.status(400).json({ message: 'A holiday rule already exists for this date.' });
      }
    }

    await rule.save();
    res.json(rule);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deletePricingRule = async (req, res) => {
  try {
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid pricing rule ID format' });
    }
    
    const rule = await PricingRule.findById(req.params.id);
    if (!rule) {
      return res.status(404).json({ message: 'Pricing rule not found' });
    }

    await rule.deleteOne();
    res.json({ message: 'Pricing rule deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

