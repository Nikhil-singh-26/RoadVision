import Pothole from '../models/Pothole.js';
import { validationResult } from 'express-validator';

// @desc    Report new pothole (From YOLO Python Script)
// @route   POST /api/potholes/detect
// @access  Public (or protected via API key depending on requirements, kept public for mock script ease)
export const reportPothole = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { latitude, longitude, severityLevel, confidence, imageUrl, description } = req.body;

  try {
    const pothole = await Pothole.create({
      latitude,
      longitude,
      severityLevel,
      detectionConfidence: confidence,
      imageUrl,
      description,
      status: 'reported',
    });

    res.status(201).json(pothole);
  } catch (error) {
    res.status(500).json({ message: 'Server error reporting pothole', error: error.message });
  }
};

// @desc    Get all potholes
// @route   GET /api/potholes
// @access  Public/Private (Dashboard view)
export const getPotholes = async (req, res) => {
  try {
    const { severityLevel, status } = req.query;
    
    // Build query
    const query = {};
    if (severityLevel) query.severityLevel = severityLevel;
    if (status) query.status = status;

    const potholes = await Pothole.find(query).sort({ detectedAt: -1 });
    res.json(potholes);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching potholes', error: error.message });
  }
};

// @desc    Update pothole status
// @route   PATCH /api/potholes/:id/status
// @access  Private (Admin/Officer)
export const updatePotholeStatus = async (req, res) => {
  const { status } = req.body;

  try {
    const pothole = await Pothole.findById(req.params.id);

    if (!pothole) {
      return res.status(404).json({ message: 'Pothole not found' });
    }

    if (!['reported', 'under_repair', 'fixed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    pothole.status = status;
    const updatedPothole = await pothole.save();

    res.json(updatedPothole);
  } catch (error) {
    res.status(500).json({ message: 'Server error updating status', error: error.message });
  }
};
