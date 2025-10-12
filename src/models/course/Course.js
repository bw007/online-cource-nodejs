const mongoose = require('mongoose');

const fieldNames = require('@/constants/fieldNames');
const { commonValidation } = require('@/constants/validations');
const { COURSE_CATEGORIES, COURSE_CATEGORY_VALUES } = require('@/constants/enums');

const CourseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, commonValidation.REQUIRED(fieldNames.course.title)],
    trim: true,
    maxLength: [100, commonValidation.MAX_LENGTH(fieldNames.course.title, 100)]
  },
  
  description: {
    type: String,
    required: [true, commonValidation.REQUIRED(fieldNames.course.description)],
    trim: true,
    maxLength: [1000, commonValidation.MAX_LENGTH(fieldNames.course.description, 1000)]
  },
  
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Instructor',
    required: true
  },
  
  price: {
    type: Number,
    required: [true, commonValidation.REQUIRED(fieldNames.course.price)],
    min: [0, commonValidation.INVALID_PRICE(fieldNames.course.price)],
    default: 0
  },
  
  thumbnail: {
    type: String,
    default: null
  },
  
  category: {
    type: String,
    required: [true, commonValidation.REQUIRED(fieldNames.course.category)],
    enum: {
      values: COURSE_CATEGORY_VALUES,
      message: commonValidation.INVALID_CATEGORY
    },
    default: COURSE_CATEGORIES.DEVELOPMENT
  },
  
  isPublished: {
    type: Boolean,
    default: false
  },
  
  studentsCount: {
    type: Number,
    default: 0
  }
  
}, {
  timestamps: true
});

// Basic indexes
CourseSchema.index({ instructor: 1 });
CourseSchema.index({ createdAt: -1 });

CourseSchema.index({ title: 1 });
CourseSchema.index({ category: 1, isPublished: 1 });
CourseSchema.index({ price: 1 });
CourseSchema.index({ studentsCount: -1 });

// Virtual for lessons count
CourseSchema.virtual('lessonsCount', {
  ref: 'Lesson',
  localField: '_id',
  foreignField: 'course',
  count: true
});

// Auto-populate instructor
CourseSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'instructor',
    select: 'name email avatar title bio socials'
  });
  next();
});

CourseSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Course', CourseSchema);