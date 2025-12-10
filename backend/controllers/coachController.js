const Coach = require('../models/Coach');

exports.getAllCoaches = async (req, res) => {
  try {
    const coaches = await Coach.find({ isActive: true }).sort({ createdAt: -1 });
    res.json(coaches);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getCoachById = async (req, res) => {
  try {
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid coach ID format' });
    }
    
    const coach = await Coach.findById(req.params.id);
    if (!coach) {
      return res.status(404).json({ message: 'Coach not found' });
    }
    res.json(coach);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createCoach = async (req, res) => {
  try {
    const { name, expertise, hourlyRate, availability, isActive } = req.body;
    
    const coach = new Coach({
      name,
      expertise,
      hourlyRate,
      availability: availability || [],
      isActive: isActive !== undefined ? isActive : true
    });

    await coach.save();
    res.status(201).json(coach);
  } catch (error) {
    console.error(error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateCoach = async (req, res) => {
  try {
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid coach ID format' });
    }
    
    const { name, expertise, hourlyRate, availability, isActive } = req.body;
    
    const coach = await Coach.findById(req.params.id);
    if (!coach) {
      return res.status(404).json({ message: 'Coach not found' });
    }

    if (name) coach.name = name;
    if (expertise !== undefined) coach.expertise = expertise;
    if (hourlyRate !== undefined) coach.hourlyRate = hourlyRate;
    if (availability) coach.availability = availability;
    if (isActive !== undefined) coach.isActive = isActive;

    await coach.save();
    res.json(coach);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

