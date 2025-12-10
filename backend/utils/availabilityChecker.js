const Booking = require('../models/Booking');
const Coach = require('../models/Coach');
const Equipment = require('../models/Equipment');

/**
 * Check if court is available for the given time slot
 */
async function isCourtAvailable(courtId, startTime, endTime, excludeBookingId = null) {
  const query = {
    court: courtId,
    status: 'confirmed',
    $or: [
      {
        startTime: { $lt: new Date(endTime) },
        endTime: { $gt: new Date(startTime) }
      }
    ]
  };

  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }

  const conflictingBooking = await Booking.findOne(query);
  return !conflictingBooking;
}

/**
 * Check if coach is available for the given time slot
 */
async function isCoachAvailable(coachId, startTime, endTime, excludeBookingId = null) {
  const coach = await Coach.findById(coachId);
  if (!coach || !coach.isActive) {
    return false;
  }

  // Check coach working hours using minutes to avoid boundary issues
  const bookingStart = new Date(startTime);
  const bookingEnd = new Date(endTime);
  const dayOfWeek = bookingStart.getDay();
  const startMinutes = bookingStart.getHours() * 60 + bookingStart.getMinutes();
  const endMinutes = bookingEnd.getHours() * 60 + bookingEnd.getMinutes();

  // Must be within the same day for availability checks
  if (bookingStart.getDay() !== bookingEnd.getDay()) {
    return false;
  }

  const available = coach.availability.some((avail) => {
    if (avail.dayOfWeek !== dayOfWeek) {
      return false;
    }

    const availStartMinutes = avail.startHour * 60;
    const availEndMinutes = avail.endHour * 60;

    // booking must start at/after avail start and end at/before avail end
    return startMinutes >= availStartMinutes && endMinutes <= availEndMinutes;
  });

  if (!available) {
    return false;
  }

  // Check for conflicting bookings
  const query = {
    'resources.coach': coachId,
    status: 'confirmed',
    $or: [
      {
        startTime: { $lt: new Date(endTime) },
        endTime: { $gt: new Date(startTime) }
      }
    ]
  };

  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }

  const conflictingBooking = await Booking.findOne(query);
  return !conflictingBooking;
}

/**
 * Check if equipment is available in sufficient quantity
 */
async function isEquipmentAvailable(equipmentRequests, startTime, endTime, excludeBookingId = null) {
  for (const request of equipmentRequests) {
    const equipment = await Equipment.findById(request.equipmentId);
    if (!equipment || !equipment.isActive) {
      return { available: false, message: `Equipment ${request.equipmentId} not found or inactive` };
    }

    // Get all bookings that overlap with this time slot
    const query = {
      status: 'confirmed',
      'resources.equipment.equipmentId': request.equipmentId,
      $or: [
        {
          startTime: { $lt: new Date(endTime) },
          endTime: { $gt: new Date(startTime) }
        }
      ]
    };

    if (excludeBookingId) {
      query._id = { $ne: excludeBookingId };
    }

    const overlappingBookings = await Booking.find(query);
    
    // Calculate total booked quantity
    let bookedQuantity = 0;
    overlappingBookings.forEach(booking => {
      const equipmentItem = booking.resources.equipment.find(
        item => item.equipmentId.toString() === request.equipmentId.toString()
      );
      if (equipmentItem) {
        bookedQuantity += equipmentItem.quantity;
      }
    });

    const availableStock = equipment.totalStock - bookedQuantity;
    
    if (availableStock < request.quantity) {
      return { 
        available: false, 
        message: `Insufficient stock for ${equipment.name}. Available: ${availableStock}, Requested: ${request.quantity}` 
      };
    }
  }

  return { available: true };
}

module.exports = {
  isCourtAvailable,
  isCoachAvailable,
  isEquipmentAvailable
};

