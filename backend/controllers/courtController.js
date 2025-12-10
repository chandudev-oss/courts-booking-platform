const Court = require('../models/Court');

exports.getAllCourts = async (req, res) => {
  try {
    // Public route - only active courts
    const courts = await Court.find({ isActive: true }).sort({ createdAt: -1 });
    res.json(courts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getCourtById = async (req, res) => {
  try {
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid court ID format' });
    }
    
    const court = await Court.findById(req.params.id);
    if (!court) {
      return res.status(404).json({ message: 'Court not found' });
    }
    res.json(court);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createCourt = async (req, res) => {
  try {
    const { name, type, basePrice, imageURL, rating, ratingCount, isActive } = req.body;
    
    const court = new Court({
      name,
      type,
      basePrice,
      imageURL: imageURL || '',
      rating: rating !== undefined ? rating : 4.5,
      ratingCount: ratingCount !== undefined ? ratingCount : 0,
      isActive: isActive !== undefined ? isActive : true
    });

    await court.save();
    res.status(201).json(court);
  } catch (error) {
    console.error(error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateCourt = async (req, res) => {
  try {
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid court ID format' });
    }
    
    const { name, type, basePrice, imageURL, rating, ratingCount, isActive } = req.body;
    
    const court = await Court.findById(req.params.id);
    if (!court) {
      return res.status(404).json({ message: 'Court not found' });
    }

    if (name) court.name = name;
    if (type) court.type = type;
    if (basePrice !== undefined) court.basePrice = basePrice;
    if (imageURL !== undefined) court.imageURL = imageURL;
    if (rating !== undefined) court.rating = rating;
    if (ratingCount !== undefined) court.ratingCount = ratingCount;
    if (isActive !== undefined) court.isActive = isActive;

    await court.save();
    res.json(court);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteCourt = async (req, res) => {
  try {
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid court ID format' });
    }
    
    const court = await Court.findById(req.params.id);
    if (!court) {
      return res.status(404).json({ message: 'Court not found' });
    }

    await court.deleteOne();
    res.json({ message: 'Court deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

