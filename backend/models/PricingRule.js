const mongoose = require('mongoose');

const pricingRuleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['fixed', 'multiplier'],
    required: true
  },
  condition: {
    dayOfWeek: [Number], // Array of day numbers (0-6)
    startHour: Number,
    endHour: Number,
    isHoliday: Boolean,
    date: String,
    type: [String] // court types the rule applies to (e.g., ['indoor'])
  },
  value: {
    type: Number,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('PricingRule', pricingRuleSchema);

