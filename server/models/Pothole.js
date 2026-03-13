import mongoose from 'mongoose';

const potholeSchema = new mongoose.Schema(
  {
    latitude: {
      type: Number,
      required: true
    },
    longitude: {
      type: Number,
      required: true
    },
    severityLevel: {
      type: String,
      enum: ['low', 'medium', 'high'],
      required: true
    },
    detectionConfidence: {
      type: Number,
      required: true,
      min: 0,
      max: 1
    },
    imageUrl: {
      type: String, // Can be from AWS S3, Cloudinary, or even local temporary static path
      required: false
    },
    description: {
      type: String,
      required: false,
      trim: true,
      maxlength: 1000
    },
    status: {
      type: String,
      enum: ['reported', 'under_repair', 'fixed'],
      default: 'reported'
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false
    }
  },
  {
    timestamps: { createdAt: 'detectedAt', updatedAt: 'updatedAt' }
  }
);

export default mongoose.model('Pothole', potholeSchema);
