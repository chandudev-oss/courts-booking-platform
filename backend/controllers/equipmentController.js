const Equipment = require('../models/Equipment');

exports.getAllEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.find({ isActive: true }).sort({ createdAt: -1 });
    res.json(equipment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getEquipmentById = async (req, res) => {
  try {
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid equipment ID format' });
    }
    
    const equipment = await Equipment.findById(req.params.id);
    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found' });
    }
    res.json(equipment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createEquipment = async (req, res) => {
  try {
    const { name, totalStock, perUnitFee, isActive } = req.body;
    
    const equipment = new Equipment({
      name,
      totalStock,
      perUnitFee,
      isActive: isActive !== undefined ? isActive : true
    });

    await equipment.save();
    res.status(201).json(equipment);
  } catch (error) {
    console.error(error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Equipment with this name already exists' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateEquipment = async (req, res) => {
  try {
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid equipment ID format' });
    }
    
    const { name, totalStock, perUnitFee, isActive } = req.body;
    
    const equipment = await Equipment.findById(req.params.id);
    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found' });
    }

    if (name) equipment.name = name;
    if (totalStock !== undefined) equipment.totalStock = totalStock;
    if (perUnitFee !== undefined) equipment.perUnitFee = perUnitFee;
    if (isActive !== undefined) equipment.isActive = isActive;

    await equipment.save();
    res.json(equipment);
  } catch (error) {
    console.error(error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Equipment with this name already exists' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

