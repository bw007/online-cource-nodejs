// src/models/section/Section.js
const mongoose = require('mongoose');

const SectionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Section title is required'],
    trim: true,
    maxLength: [100, 'Section title cannot exceed 100 characters']
  },
  
  description: {
    type: String,
    trim: true,
    maxLength: [500, 'Section description cannot exceed 500 characters']
  },
  
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Course is required']
  },
  
  order: {
    type: Number,
    required: [true, 'Section order is required'],
    min: [1, 'Order must be at least 1']
  },
  
  isPublished: {
    type: Boolean,
    default: false
  }
  
}, {
  timestamps: true
});

// Indexes
SectionSchema.index({ course: 1, order: 1 }, { unique: true });
SectionSchema.index({ course: 1, isPublished: 1 });

// Virtual for lessons count
SectionSchema.virtual('lessonsCount', {
  ref: 'Lesson',
  localField: '_id',
  foreignField: 'section',
  count: true
});

SectionSchema.set('toJSON', { virtuals: true });
SectionSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Section', SectionSchema);