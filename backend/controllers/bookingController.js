const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const { calculatePricing } = require('../utils/pricingEngine');
const {
  isCourtAvailable,
  isCoachAvailable,
  isEquipmentAvailable
} = require('../utils/availabilityChecker');

// Convert any date to normalized UTC
const toUTC = (date) => new Date(new Date(date).toISOString());

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

    // Convert to Date objects
    const start = new Date(startTime);
    const end = new Date(endTime);

    // Convert everything to UTC and use these consistently
    const startUTC = toUTC(start);
    const endUTC = toUTC(end);

    if (isNaN(startUTC.getTime()) || isNaN(endUTC.getTime())) {
      await session.abortTransaction();
      await session.endSession();
      return res.status(400).json({ message: 'Invalid date format for startTime or endTime' });
    }

    if (endUTC <= startUTC) {
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
    const courtAvailable = await isCourtAvailable(courtId, startUTC, endUTC);
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

      const coachAvailable = await isCoachAvailable(coachId, startUTC, endUTC);
      if (!coachAvailable) {
        await session.abortTransaction();
        await session.endSession();
        return res.status(400).json({ message: 'Coach is not available for the selected time' });
      }
    }

    // Check equipment availability
    if (equipment && equipment.length > 0) {
      if (!Array.isArray(equipment)) {
        await session.abortTransaction();
        await session.endSession();
        return res.status(400).json({ message: 'Equipment must be an array' });
      }

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

      const equipmentCheck = await isEquipmentAvailable(equipment, startUTC, endUTC);
      if (!equipmentCheck.available) {
        await session.abortTransaction();
        await session.endSession();
        return res.status(400).json({ message: equipmentCheck.message });
      }
    }

    // Calculate pricing with UTC times
    const pricingBreakdown = await calculatePricing({
      courtId,
      startTime: startUTC,
      endTime: endUTC,
      equipment,
      coachId
    });

    // Create booking
    const booking = new Booking({
      user: req.user._id,
      court: courtId,
      startTime: startUTC,
      endTime: endUTC,
      resources: {
        equipment: equipment || [],
        coach: coachId || null
      },
      pricingBreakdown,
      status: 'confirmed'
    });

    await booking.save({ session });
    await session.commitTransaction();

    // Populate returned object
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
    }

    res.status(201).json(booking);
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    console.error(error);

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
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid booking ID format' });
    }

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

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
