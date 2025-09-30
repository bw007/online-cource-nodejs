const mongoose = require('mongoose');
const { commonValidation } = require('@/constants/validations');

const EnrollmentSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, commonValidation.REQUIRED('student')]
  },
  
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, commonValidation.REQUIRED('course')]
  },
  
  enrolledAt: {
    type: Date,
    default: Date.now
  },
  
  // Progress tracking
  completedLessons: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson'
  }],
  
  // Overall progress percentage (0-100)
  progressPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  
  // Last activity
  lastWatchedLesson: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson',
    default: null
  },
  
  lastActivityAt: {
    type: Date,
    default: Date.now
  },
  
  // Course completion
  isCompleted: {
    type: Boolean,
    default: false
  },
  
  completedAt: {
    type: Date,
    default: null
  }
  
}, {
  timestamps: true,
  versionKey: false
});

// Compound index for unique enrollment per user-course
EnrollmentSchema.index({ student: 1, course: 1 }, { unique: true });

// Indexes for performance
EnrollmentSchema.index({ student: 1, isCompleted: 1 });
EnrollmentSchema.index({ course: 1, enrolledAt: -1 });

// Auto-populate course and student info
EnrollmentSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'course',
    select: 'title thumbnail instructor'
  }).populate({
    path: 'student',
    select: 'name email'
  });
  next();
});

module.exports = mongoose.model('Enrollment', EnrollmentSchema);

