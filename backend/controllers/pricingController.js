const { calculatePricing } = require('../utils/pricingEngine');

exports.estimatePrice = async (req, res) => {
  try {
    const { courtId, startTime, endTime, equipment, coachId } = req.body;

    if (!courtId || !startTime || !endTime) {
      return res.status(400).json({ message: 'courtId, startTime, and endTime are required' });
    }

    const pricingBreakdown = await calculatePricing({
      courtId,
      startTime,
      endTime,
      equipment,
      coachId
    });

    res.json(pricingBreakdown);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

