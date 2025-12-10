const PricingRule = require('../models/PricingRule');
const Court = require('../models/Court');
const Equipment = require('../models/Equipment');
const Coach = require('../models/Coach');

/**
 * Calculate pricing breakdown for a booking
 */
async function calculatePricing(bookingData) {
  const { courtId, startTime, endTime, equipment, coachId } = bookingData;
  
  // Get court base price
  const court = await Court.findById(courtId);
  if (!court) {
    throw new Error('Court not found');
  }

  let basePrice = court.basePrice;
  const duration = (new Date(endTime) - new Date(startTime)) / (1000 * 60 * 60); // hours
  basePrice = basePrice * duration;

  const breakdown = {
    basePrice: basePrice,
    peakFee: 0,
    weekendFee: 0,
    equipmentFee: 0,
    coachFee: 0,
    total: basePrice
  };

  const bookingDate = new Date(startTime);
  const bookingDateStr = bookingDate.toISOString().split('T')[0]; // YYYY-MM-DD
  const dayOfWeek = bookingDate.getDay();
  const hour = bookingDate.getHours();

  // Apply pricing rules (including holiday and court-type conditions)
  const rules = await PricingRule.find({ isActive: true });
  
  for (const rule of rules) {
    let applies = true;

    // Court type condition
    if (rule.condition.type && rule.condition.type.length) {
      applies = applies && rule.condition.type.includes(court.type);
    }

    // Specific date (holiday) condition
    if (rule.condition.date) {
      applies = applies && rule.condition.date === bookingDateStr;
    }

    // Day of week condition
    if (rule.condition.dayOfWeek && rule.condition.dayOfWeek.length > 0) {
      applies = applies && rule.condition.dayOfWeek.includes(dayOfWeek);
    }

    // Hour range condition
    if (rule.condition.startHour !== undefined && rule.condition.endHour !== undefined) {
      const hourMatches = hour >= rule.condition.startHour && hour < rule.condition.endHour;
      applies = applies && hourMatches;
    }

    if (!applies) continue;

    if (rule.type === 'multiplier') {
      basePrice = basePrice * rule.value;
      breakdown.basePrice = basePrice;
    } else if (rule.type === 'fixed') {
      // Treat date-based or weekend day rules as weekendFee; otherwise peakFee
      const isWeekend =
        (rule.condition.dayOfWeek &&
          (rule.condition.dayOfWeek.includes(0) || rule.condition.dayOfWeek.includes(6))) ||
        !!rule.condition.date;
      if (isWeekend) {
        breakdown.weekendFee += rule.value;
      } else {
        breakdown.peakFee += rule.value;
      }
    }
  }

  // Calculate equipment fees
  if (equipment && equipment.length > 0) {
    for (const item of equipment) {
      const equip = await Equipment.findById(item.equipmentId);
      if (equip) {
        breakdown.equipmentFee += equip.perUnitFee * item.quantity;
      }
    }
  }

  // Calculate coach fee
  if (coachId) {
    const coach = await Coach.findById(coachId);
    if (coach) {
      breakdown.coachFee = coach.hourlyRate * duration;
    }
  }

  // Calculate total
  breakdown.total = breakdown.basePrice + breakdown.peakFee + breakdown.weekendFee + 
                    breakdown.equipmentFee + breakdown.coachFee;

  return breakdown;
}

module.exports = { calculatePricing };

