// src/models/lesson/Lesson.js
const mongoose = require('mongoose');
const fieldNames = require('@/constants/fieldNames');
const { commonValidation } = require('@/constants/validations');

const LessonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, commonValidation.REQUIRED(fieldNames.lesson.title)],
    trim: true,
    maxLength: [100, commonValidation.MAX_LENGTH(fieldNames.lesson.title, 100)]
  },
  
  description: {
    type: String,
    trim: true,
    maxLength: [500, commonValidation.MAX_LENGTH(fieldNames.lesson.description, 500)]
  },
  
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, commonValidation.REQUIRED(fieldNames.lesson.course)]
  },
  
  section: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Section',
    default: null
  },
  
  video: {
    qualities: {
      '360p': {
        type: String,
        default: null
      },
      '720p': {
        type: String,
        default: null
      },
      '1080p': {
        type: String,
        default: null
      }
    },
    defaultQuality: {
      type: String,
      enum: ['360p', '720p', '1080p'],
      default: '720p'
    },
    originalUrl: {
      type: String,
      required: [true, commonValidation.VIDEO_URL_REQUIRED],
      trim: true
    }
  },
  
  duration: {
    type: Number,
    required: [true, commonValidation.REQUIRED(fieldNames.lesson.duration)],
    min: [1, 'Duration must be at least 1 second']
  },
  
  order: {
    type: Number,
    required: [true, commonValidation.REQUIRED(fieldNames.lesson.order)],
    min: [1, commonValidation.INVALID_ORDER]
  },
  
  isPreview: {
    type: Boolean,
    default: false
  },
  
  isPublished: {
    type: Boolean,
    default: false
  }
  
}, {
  timestamps: true
});

// Indexes
LessonSchema.index({ course: 1, section: 1, order: 1 }, { unique: true });
LessonSchema.index({ course: 1, isPublished: 1 });
LessonSchema.index({ section: 1, isPublished: 1 });
LessonSchema.index({ isPreview: 1 });

LessonSchema.pre(/^find/, function(next) {
  if (!this.getOptions().populate) {
    this.populate({
      path: 'course',
      select: 'title instructor isPublished'
    }).populate({
      path: 'section',
      select: 'title order'
    });
  }
  next();
});

LessonSchema.virtual('formattedDuration').get(function() {
  const minutes = Math.floor(this.duration / 60);
  const seconds = this.duration % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
});

LessonSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Lesson', LessonSchema);