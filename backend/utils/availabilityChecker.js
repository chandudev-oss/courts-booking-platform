const Booking = require('../models/Booking');
const Coach = require('../models/Coach');
const Equipment = require('../models/Equipment');

/**
 * Convert any incoming time to UTC Date object
 */
function toUTC(date) {
  return new Date(new Date(date).toISOString());
}

/**
 * Court availability check
 */
async function isCourtAvailable(courtId, startTime, endTime, excludeBookingId = null) {
  const startUTC = toUTC(startTime);
  const endUTC = toUTC(endTime);

  const query = {
    court: courtId,
    status: 'confirmed',
    $or: [
      {
        startTime: { $lt: endUTC },
        endTime: { $gt: startUTC }
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
 * Coach availability check
 */
async function isCoachAvailable(coachId, startTime, endTime, excludeBookingId = null) {
  const coach = await Coach.findById(coachId);
  if (!coach || !coach.isActive) {
    return false;
  }

  const bookingStart = toUTC(startTime);
  const bookingEnd = toUTC(endTime);

  // Working hours must use local hours
  const dayOfWeek = bookingStart.getUTCDay();
  const startMinutes = bookingStart.getUTCHours() * 60 + bookingStart.getUTCMinutes();
  const endMinutes = bookingEnd.getUTCHours() * 60 + bookingEnd.getUTCMinutes();

  if (bookingStart.getUTCDate() !== bookingEnd.getUTCDate()) {
    return false; // Must be same-day booking
  }

  const available = coach.availability.some((avail) => {
    if (avail.dayOfWeek !== dayOfWeek) return false;

    const availStart = avail.startHour * 60;
    const availEnd = avail.endHour * 60;

    return startMinutes >= availStart && endMinutes <= availEnd;
  });

  if (!available) return false;

  // Check for existing bookings
  const query = {
    'resources.coach': coachId,
    status: 'confirmed',
    $or: [
      {
        startTime: { $lt: bookingEnd },
        endTime: { $gt: bookingStart }
      }
    ]
  };

  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }

  const conflicted = await Booking.findOne(query);
  return !conflicted;
}

/**
 * Equipment availability
 */
async function isEquipmentAvailable(equipmentRequests, startTime, endTime, excludeBookingId = null) {
  const startUTC = toUTC(startTime);
  const endUTC = toUTC(endTime);

  for (const req of equipmentRequests) {
    const equipment = await Equipment.findById(req.equipmentId);
    if (!equipment || !equipment.isActive) {
      return { available: false, message: `Equipment ${req.equipmentId} not found or inactive` };
    }

    const query = {
      status: 'confirmed',
      'resources.equipment.equipmentId': req.equipmentId,
      $or: [
        {
          startTime: { $lt: endUTC },
          endTime: { $gt: startUTC }
        }
      ]
    };

    if (excludeBookingId) {
      query._id = { $ne: excludeBookingId };
    }

    const bookings = await Booking.find(query);

    let bookedQuantity = 0;
    bookings.forEach(booking => {
      const item = booking.resources.equipment.find(
        e => e.equipmentId.toString() === req.equipmentId.toString()
      );
      if (item) bookedQuantity += item.quantity;
    });

    const availableStock = equipment.totalStock - bookedQuantity;

    if (availableStock < req.quantity) {
      return {
        available: false,
        message: `Insufficient stock for ${equipment.name}. Available: ${availableStock}, Requested: ${req.quantity}`
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
