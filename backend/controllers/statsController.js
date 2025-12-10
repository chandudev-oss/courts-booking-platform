const Booking = require('../models/Booking');
const Court = require('../models/Court');
const Coach = require('../models/Coach');
const Equipment = require('../models/Equipment');
const PricingRule = require('../models/PricingRule');
const User = require('../models/User');

exports.getDashboardStats = async (req, res) => {
  try {
    // Get total counts
    const totalCourts = await Court.countDocuments();
    const activeCourts = await Court.countDocuments({ isActive: true });
    const totalCoaches = await Coach.countDocuments();
    const activeCoaches = await Coach.countDocuments({ isActive: true });
    const totalEquipment = await Equipment.countDocuments();
    const activeEquipment = await Equipment.countDocuments({ isActive: true });
    const totalPricingRules = await PricingRule.countDocuments();
    const activePricingRules = await PricingRule.countDocuments({ isActive: true });

    // Get booking statistics
    const totalBookings = await Booking.countDocuments();
    const confirmedBookings = await Booking.countDocuments({ status: 'confirmed' });
    const cancelledBookings = await Booking.countDocuments({ status: 'cancelled' });

    // Calculate revenue from confirmed bookings
    const bookingsRevenue = await Booking.aggregate([
      { $match: { status: 'confirmed' } },
      { $group: { _id: null, total: { $sum: '$pricingBreakdown.total' } } }
    ]);
    const totalRevenue = bookingsRevenue.length > 0 ? bookingsRevenue[0].total : 0;

    // Get today's bookings
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const todayBookings = await Booking.countDocuments({
      status: 'confirmed',
      startTime: { $gte: today, $lt: tomorrow }
    });

    // Get upcoming bookings (next 7 days)
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    const upcomingBookings = await Booking.countDocuments({
      status: 'confirmed',
      startTime: { $gte: today, $lt: nextWeek }
    });

    // Get recent bookings (last 5)
    const recentBookings = await Booking.find()
      .populate('user', 'name email')
      .populate('court', 'name type basePrice')
      .sort({ createdAt: -1 })
      .limit(5);

    // Calculate average booking value
    const avgBookingValue = confirmedBookings > 0 ? totalRevenue / confirmedBookings : 0;

    // Get pricing breakdown statistics
    const pricingStats = await Booking.aggregate([
      { $match: { status: 'confirmed' } },
      {
        $group: {
          _id: null,
          avgBasePrice: { $avg: '$pricingBreakdown.basePrice' },
          avgPeakFee: { $avg: '$pricingBreakdown.peakFee' },
          avgWeekendFee: { $avg: '$pricingBreakdown.weekendFee' },
          avgEquipmentFee: { $avg: '$pricingBreakdown.equipmentFee' },
          avgCoachFee: { $avg: '$pricingBreakdown.coachFee' },
          avgTotal: { $avg: '$pricingBreakdown.total' }
        }
      }
    ]);

    const pricingBreakdown = pricingStats.length > 0 ? pricingStats[0] : {
      avgBasePrice: 0,
      avgPeakFee: 0,
      avgWeekendFee: 0,
      avgEquipmentFee: 0,
      avgCoachFee: 0,
      avgTotal: 0
    };

    res.json({
      courts: {
        total: totalCourts,
        active: activeCourts,
        inactive: totalCourts - activeCourts
      },
      coaches: {
        total: totalCoaches,
        active: activeCoaches,
        inactive: totalCoaches - activeCoaches
      },
      equipment: {
        total: totalEquipment,
        active: activeEquipment,
        inactive: totalEquipment - activeEquipment
      },
      pricingRules: {
        total: totalPricingRules,
        active: activePricingRules,
        inactive: totalPricingRules - activePricingRules
      },
      bookings: {
        total: totalBookings,
        confirmed: confirmedBookings,
        cancelled: cancelledBookings,
        today: todayBookings,
        upcoming: upcomingBookings
      },
      revenue: {
        total: totalRevenue.toFixed(2),
        averageBooking: avgBookingValue.toFixed(2)
      },
      pricingBreakdown: {
        avgBasePrice: pricingBreakdown.avgBasePrice.toFixed(2),
        avgPeakFee: pricingBreakdown.avgPeakFee.toFixed(2),
        avgWeekendFee: pricingBreakdown.avgWeekendFee.toFixed(2),
        avgEquipmentFee: pricingBreakdown.avgEquipmentFee.toFixed(2),
        avgCoachFee: pricingBreakdown.avgCoachFee.toFixed(2),
        avgTotal: pricingBreakdown.avgTotal.toFixed(2)
      },
      recentBookings
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

