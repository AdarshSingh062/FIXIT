const mongoose = require('mongoose');
const { COMPLAINT_PRIORITY } = require('../config/constants');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      unique: true,
      trim: true
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true
    },
    description: {
      type: String,
      default: ''
    },
    icon: {
      type: String,
      default: 'AlertCircle'
    },
    color: {
      type: String,
      default: '#3b82f6'
    },
    defaultPriority: {
      type: String,
      enum: Object.values(COMPLAINT_PRIORITY),
      default: COMPLAINT_PRIORITY.MEDIUM
    },
    slaHours: {
      type: Number,
      default: 48,
      min: [1, 'SLA must be at least 1 hour']
    },
    isActive: {
      type: Boolean,
      default: true
    },
    department: {
      type: String,
      default: 'Public Works'
    }
  },
  {
    timestamps: true
  }
);

// Auto slugify pre-save hook
categorySchema.pre('save', function (next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');
  }
  next();
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
