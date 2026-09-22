const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { ROLES, USER_STATUS, WORKER_STATUS } = require('../config/constants');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address']
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.USER
    },
    phone: {
      type: String,
      trim: true,
      default: ''
    },
    avatar: {
      type: String,
      default: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'
    },
    bio: {
      type: String,
      maxlength: [300, 'Bio cannot exceed 300 characters'],
      default: ''
    },
    status: {
      type: String,
      enum: Object.values(USER_STATUS),
      default: USER_STATUS.ACTIVE
    },
    workerDetails: {
      department: { type: String, default: 'General Maintenance' },
      specialization: { type: String, default: 'Roads & Infrastructure' },
      skills: [{ type: String }],
      status: {
        type: String,
        enum: Object.values(WORKER_STATUS),
        default: WORKER_STATUS.AVAILABLE
      },
      activeTasks: { type: Number, default: 0 },
      completedTasks: { type: Number, default: 0 },
      avgRating: { type: Number, default: 5.0, min: 0, max: 5 },
      totalRatings: { type: Number, default: 0 }
    },
    lastLogin: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

// Indexes
userSchema.index({ role: 1 });
userSchema.index({ 'workerDetails.department': 1 });

// Password hashing pre-save hook
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Instance method to check password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Instance method to generate JWT
userSchema.methods.getSignedJwtToken = function () {
  return jwt.sign(
    {
      id: this._id,
      name: this.name,
      email: this.email,
      role: this.role,
      status: this.status
    },
    process.env.JWT_SECRET || 'fixit_super_secure_jwt_secret_key_2026_production_ready',
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    }
  );
};

const User = mongoose.model('User', userSchema);

module.exports = User;
