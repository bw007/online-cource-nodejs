const mongoose = require('mongoose');

const ProgressSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  lesson: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson',
    required: true
  },
  
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  
  // Video watch progress
  watchTime: {
    type: Number, // seconds
    default: 0
  },
  
  // Lesson completion status
  isCompleted: {
    type: Boolean,
    default: false
  },
  
  completedAt: {
    type: Date,
    default: null
  },
  
  // Watch percentage (0-100)
  watchPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  }
  
}, {
  timestamps: true,
  versionKey: false
});

// Compound index for unique progress per user-lesson
ProgressSchema.index({ student: 1, lesson: 1 }, { unique: true });

// Indexes for performance
ProgressSchema.index({ student: 1, course: 1 });
ProgressSchema.index({ lesson: 1, isCompleted: 1 });

module.exports = mongoose.model('Progress', ProgressSchema);