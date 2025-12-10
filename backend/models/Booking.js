const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  court: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Court',
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  resources: {
    equipment: [{
      equipmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Equipment'
      },
      quantity: {
        type: Number,
        min: 0
      }
    }],
    coach: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Coach'
    }
  },
  pricingBreakdown: {
    basePrice: Number,
    peakFee: Number,
    weekendFee: Number,
    equipmentFee: Number,
    coachFee: Number,
    total: Number
  },
  status: {
    type: String,
    enum: ['confirmed', 'cancelled'],
    default: 'confirmed'
  }
}, {
  timestamps: true
});

// Indexes for performance
bookingSchema.index({ court: 1, startTime: 1, endTime: 1 });
bookingSchema.index({ 'resources.coach': 1, startTime: 1, endTime: 1 });
bookingSchema.index({ user: 1 });

module.exports = mongoose.model('Booking', bookingSchema);

