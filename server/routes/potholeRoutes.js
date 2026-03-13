import express from 'express';
import { body } from 'express-validator';
import { reportPothole, getPotholes, updatePotholeStatus } from '../controllers/potholeController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public route for YOLO script
router.post(
  '/detect',
  [
    body('latitude', 'Latitude is required and must be a number').isNumeric(),
    body('longitude', 'Longitude is required and must be a number').isNumeric(),
    body('severityLevel', 'Severity level is required (low, medium, high)').isIn(['low', 'medium', 'high']),
    body('confidence', 'Confidence is required').isNumeric(),
  ],
  reportPothole
);

// Get all potholes
router.get('/', getPotholes);

// Update status (Protected - Officers/Admins only)
router.patch(
  '/:id/status',
  protect,
  authorize('admin', 'officer'),
  updatePotholeStatus
);

export default router;
