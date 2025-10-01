const mongoose = require('mongoose');

const ProgressSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  lesson: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson',
    required: true
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Index
ProgressSchema.index({ student: 1, course: 1, lesson: 1 }, { unique: true });
ProgressSchema.index({ student: 1, course: 1 });

module.exports = mongoose.model('Progress', ProgressSchema);