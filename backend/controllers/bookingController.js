const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const { calculatePricing } = require('../utils/pricingEngine');
const {
  isCourtAvailable,
  isCoachAvailable,
  isEquipmentAvailable
} = require('../utils/availabilityChecker');

exports.createBooking = async (req, res) => {
  const session = await Booking.db.startSession();
  session.startTransaction();

  try {
    const { courtId, startTime, endTime, equipment, coachId } = req.body;

    // Validate required fields
    if (!courtId || !startTime || !endTime) {
      await session.abortTransaction();
      await session.endSession();
      return res.status(400).json({ message: 'courtId, startTime, and endTime are required' });
    }

    // Validate time
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    // Check if dates are valid
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      await session.abortTransaction();
      await session.endSession();
      return res.status(400).json({ message: 'Invalid date format for startTime or endTime' });
    }
    
    if (end <= start) {
      await session.abortTransaction();
      await session.endSession();
      return res.status(400).json({ message: 'End time must be after start time' });
    }

    // Validate courtId format
    if (!mongoose.Types.ObjectId.isValid(courtId)) {
      await session.abortTransaction();
      await session.endSession();
      return res.status(400).json({ message: 'Invalid courtId format' });
    }

    // Check court availability
    const courtAvailable = await isCourtAvailable(courtId, startTime, endTime);
    if (!courtAvailable) {
      await session.abortTransaction();
      await session.endSession();
      return res.status(400).json({ message: 'Court is not available for the selected time' });
    }

    // Check coach availability if coach is requested
    if (coachId) {
      if (!mongoose.Types.ObjectId.isValid(coachId)) {
        await session.abortTransaction();
        await session.endSession();
        return res.status(400).json({ message: 'Invalid coachId format' });
      }
      const coachAvailable = await isCoachAvailable(coachId, startTime, endTime);
      if (!coachAvailable) {
        await session.abortTransaction();
        await session.endSession();
        return res.status(400).json({ message: 'Coach is not available for the selected time' });
      }
    }

    // Check equipment availability
    if (equipment && equipment.length > 0) {
      // Validate equipment array format
      if (!Array.isArray(equipment)) {
        await session.abortTransaction();
        await session.endSession();
        return res.status(400).json({ message: 'Equipment must be an array' });
      }
      
      // Validate each equipment item
      for (const item of equipment) {
        if (!item.equipmentId || !mongoose.Types.ObjectId.isValid(item.equipmentId)) {
          await session.abortTransaction();
          await session.endSession();
          return res.status(400).json({ message: 'Invalid equipmentId format' });
        }
        if (item.quantity === undefined || item.quantity < 0) {
          await session.abortTransaction();
          await session.endSession();
          return res.status(400).json({ message: 'Equipment quantity must be a non-negative number' });
        }
      }
      
      const equipmentCheck = await isEquipmentAvailable(equipment, startTime, endTime);
      if (!equipmentCheck.available) {
        await session.abortTransaction();
        await session.endSession();
        return res.status(400).json({ message: equipmentCheck.message });
      }
    }

    // Calculate pricing
    const pricingBreakdown = await calculatePricing({
      courtId,
      startTime,
      endTime,
      equipment,
      coachId
    });

    // Create booking
    const booking = new Booking({
      user: req.user._id,
      court: courtId,
      startTime: start,
      endTime: end,
      resources: {
        equipment: equipment || [],
        coach: coachId || null
      },
      pricingBreakdown,
      status: 'confirmed'
    });

    await booking.save({ session });

    await session.commitTransaction();
    
    // Populate after commit to avoid transaction issues
    try {
      await booking.populate('court', 'name type basePrice');
      if (coachId) {
        await booking.populate('resources.coach', 'name expertise hourlyRate');
      }
      if (equipment && equipment.length > 0) {
        await booking.populate('resources.equipment.equipmentId', 'name perUnitFee');
      }
    } catch (populateError) {
      console.error('Error populating booking:', populateError);
      // Continue even if populate fails - booking is already saved
    }

    res.status(201).json(booking);
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    console.error(error);
    
    // Handle specific error types
    if (error.name === 'ValidationError') {
      res.status(400).json({ message: 'Validation error', error: error.message });
    } else if (error.name === 'CastError') {
      res.status(400).json({ message: 'Invalid ID format' });
    } else {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  } finally {
    await session.endSession();
  }
};

exports.getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('court', 'name type basePrice')
      .populate('resources.coach', 'name expertise hourlyRate')
      .populate('resources.equipment.equipmentId', 'name perUnitFee')
      .sort({ startTime: -1 });
    
    res.json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('user', 'name email')
      .populate('court', 'name type basePrice')
      .populate('resources.coach', 'name expertise hourlyRate')
      .populate('resources.equipment.equipmentId', 'name perUnitFee')
      .sort({ startTime: -1 });
    
    res.json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid booking ID format' });
    }
    
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user owns the booking or is admin
    if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to cancel this booking' });
    }

    booking.status = 'cancelled';
    await booking.save();

    res.json({ message: 'Booking cancelled successfully', booking });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

