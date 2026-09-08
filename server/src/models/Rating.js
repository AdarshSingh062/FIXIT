const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema(
  {
    complaintId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Complaint',
      required: true,
      unique: true
    },
    citizen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    worker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    rating: {
      type: Number,
      required: [true, 'Rating score is required'],
      min: [1, 'Minimum rating is 1'],
      max: [5, 'Maximum rating is 5']
    },
    review: {
      type: String,
      maxlength: [1000, 'Review cannot exceed 1000 characters'],
      default: ''
    },
    punctuality: {
      type: Number,
      min: 1,
      max: 5,
      default: 5
    },
    quality: {
      type: Number,
      min: 1,
      max: 5,
      default: 5
    }
  },
  {
    timestamps: true
  }
);

ratingSchema.index({ worker: 1 });
ratingSchema.index({ citizen: 1 });

const Rating = mongoose.model('Rating', ratingSchema);

module.exports = Rating;
