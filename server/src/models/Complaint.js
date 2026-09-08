const mongoose = require('mongoose');
const { COMPLAINT_STATUS, COMPLAINT_PRIORITY } = require('../config/constants');

const timelineItemSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: Object.values(COMPLAINT_STATUS),
      required: true
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    note: {
      type: String,
      default: ''
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  { _id: true }
);

const complaintSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Complaint title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters']
    },
    description: {
      type: String,
      required: [true, 'Complaint description is required'],
      maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required']
    },
    priority: {
      type: String,
      enum: Object.values(COMPLAINT_PRIORITY),
      default: COMPLAINT_PRIORITY.MEDIUM
    },
    priorityScore: {
      type: Number,
      default: 50
    },
    priorityReason: {
      type: String,
      default: 'Calculated based on standard severity and keyword assessment'
    },
    priorityOverridden: {
      type: Boolean,
      default: false
    },
    status: {
      type: String,
      enum: Object.values(COMPLAINT_STATUS),
      default: COMPLAINT_STATUS.PENDING
    },
    images: [
      {
        type: String
      }
    ],
    beforeImages: [
      {
        type: String
      }
    ],
    resolutionImages: [
      {
        type: String
      }
    ],
    resolutionNotes: {
      type: String,
      default: ''
    },
    rejectionReason: {
      type: String,
      default: ''
    },
    reopenReason: {
      type: String,
      default: ''
    },
    location: {
      address: {
        type: String,
        default: 'Location specified on map'
      },
      landmark: {
        type: String,
        default: ''
      },
      city: {
        type: String,
        default: ''
      },
      postalCode: {
        type: String,
        default: ''
      },
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0],
        required: true
      }
    },
    latitude: {
      type: Number,
      default: 0
    },
    longitude: {
      type: Number,
      default: 0
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User creator is required']
    },
    assignedWorker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    timeline: [timelineItemSchema],
    rating: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Rating',
      default: null
    },
    slaDeadline: {
      type: Date
    },
    resolvedAt: {
      type: Date,
      default: null
    },
    closedAt: {
      type: Date,
      default: null
    },
    publicImpact: {
      type: Boolean,
      default: false
    },
    isEmergency: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// GeoJSON index for geospatial queries
complaintSchema.index({ 'location.coordinates': '2dsphere' });
complaintSchema.index({ status: 1 });
complaintSchema.index({ priority: 1 });
complaintSchema.index({ category: 1 });
complaintSchema.index({ createdBy: 1 });
complaintSchema.index({ assignedWorker: 1 });
complaintSchema.index({ createdAt: -1 });

// Virtual to populate comments count
complaintSchema.virtual('comments', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'complaintId'
});

const Complaint = mongoose.model('Complaint', complaintSchema);

module.exports = Complaint;
