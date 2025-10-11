const mongoose = require('mongoose');
const fieldNames = require('@constants/fieldNames');
const { ROLES, ROLE_VALUES } = require('@/constants/enums');
const { patternValidation, commonValidation } = require('@constants/validations');
const { PROVIDERS, PROVIDER_VALUES } = require('@constants/enums');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, commonValidation.REQUIRED(fieldNames.user.name)],
    trim: true,
    maxLength: [200, commonValidation.MAX_LENGTH(fieldNames.user.name, 200)]
  },

  email: {
    type: String,
    required: [true, commonValidation.REQUIRED(fieldNames.user.email)],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, patternValidation.INVALID_EMAIL]
  },

  password: {
    type: String,
    required: function() {
      return this.provider === PROVIDERS.LOCAL;
    },
    minLength: [8, commonValidation.MIN_LENGTH(fieldNames.user.password, 8)],
    select: false // Default state, query results will not be visible
  },

  role: {
    type: String,
    required: true,
    enum: {
      values: ROLE_VALUES,
      message: commonValidation.INVALID_ROLE
    },
    default: ROLES.STUDENT
  },

  // OAuth Integration
  provider: {
    type: String,
    enum: {
      values: PROVIDER_VALUES,
      message: commonValidation.INVALID_PROVIDER
    },
    default: PROVIDERS.LOCAL
  },

  providerId: {
    type: String,
    default: null,
    sparse: true // Multiple users can have null providerId
  },

  avatar: {
    type: String,
    default: null
  },

  // Account Status
  isActive: {
    type: Boolean,
    default: true
  },

  // Email Verification
  isEmailVerified: {
    type: Boolean,
    default: function() {
      // OAuth users are automatically verified
      return this.provider !== PROVIDERS.LOCAL;
    }
  },

  emailVerificationToken: {
    type: String,
    default: null,
    select: false
  },

  emailVerificationExpires: {
    type: Date,
    default: null
  },

  // OTP Verification Fields
  emailVerificationOTP: {
    type: String,
    default: null,
    select: false
  },

  emailVerificationOTPExpires: {
    type: Date,
    default: null
  },

  emailVerificationOTPAttempts: {
    type: Number,
    default: 0
  },

  lastOTPSentAt: {
    type: Date,
    default: null
  },

  otpResendCount: {
    type: Number,
    default: 0
  },

  otpResendCountResetAt: {
    type: Date,
    default: null
  },

  // Password Reset (Only for LOCAL provider)
  passwordResetToken: {
    type: String,
    default: null,
    select: false
  },

  passwordResetExpires: {
    type: Date,
    default: null
  },

  passwordChangedAt: {
    type: Date,
    default: null
  },

  // JWT Token Management
  tokenVersion: {
    type: String,
    default: null
  },

  refreshToken: {
    type: String,
    default: null,
    select: false
  },

  refreshTokenExpiresAt: {
    type: Date,
    default: null
  },

  lastTokenRefresh: {
    type: Date,
    default: null
  },

  // Session Management
  lastLoginAt: {
    type: Date,
    default: null
  },

  loginCount: {
    type: Number,
    default: 0,
    min: 0
  },

  // Course Relations
  enrolledCourses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }],

  cart: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }],

  favouriteCourses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }]

}, {
  timestamps: true,
  versionKey: false
});

// Indexes for performance
UserSchema.index({ favouriteCourses: 1 });
UserSchema.index({ cart: 1 });
UserSchema.index({ provider: 1, providerId: 1 });
UserSchema.index({ emailVerificationToken: 1 });
UserSchema.index({ passwordResetToken: 1 });

// Virtual for full name (if needed later)
UserSchema.virtual('displayName').get(function() {
  return this.name;
});

module.exports = UserSchema;