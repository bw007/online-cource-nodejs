const { body, param, query } = require('express-validator');

const lessonValidators = {
  // Create lesson validation
  createLesson: [
    param('courseId')
      .isMongoId()
      .withMessage('Invalid course ID'),
    body('title')
      .isLength({ min: 1, max: 100 })
      .withMessage('Lesson title must be between 1 and 100 characters')
      .trim(),
    body('description')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Lesson description must be less than 500 characters')
      .trim(),
    body('originalUrl')
      .isURL()
      .withMessage('Original URL must be a valid URL'),
    body('duration')
      .isInt({ min: 1 })
      .withMessage('Duration must be a positive integer (seconds)'),
    body('order')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Order must be a positive integer'),
    body('isPreview')
      .optional()
      .isBoolean()
      .withMessage('isPreview must be a boolean value')
  ],

  // Update lesson validation
  updateLesson: [
    param('id')
      .isMongoId()
      .withMessage('Invalid lesson ID'),
    body('title')
      .optional()
      .isLength({ min: 1, max: 100 })
      .withMessage('Lesson title must be between 1 and 100 characters')
      .trim(),
    body('description')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Lesson description must be less than 500 characters')
      .trim(),
    body('duration')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Duration must be a positive integer (seconds)'),
    body('order')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Order must be a positive integer'),
    body('isPreview')
      .optional()
      .isBoolean()
      .withMessage('isPreview must be a boolean value')
  ],

  // Update lesson video validation
  updateLessonVideo: [
    param('id')
      .isMongoId()
      .withMessage('Invalid lesson ID'),
    body('qualities')
      .optional()
      .isObject()
      .withMessage('Qualities must be an object'),
    body('qualities.360p')
      .optional()
      .isURL()
      .withMessage('360p quality must be a valid URL'),
    body('qualities.720p')
      .optional()
      .isURL()
      .withMessage('720p quality must be a valid URL'),
    body('qualities.1080p')
      .optional()
      .isURL()
      .withMessage('1080p quality must be a valid URL'),
    body('defaultQuality')
      .optional()
      .isIn(['360p', '720p', '1080p'])
      .withMessage('Default quality must be one of: 360p, 720p, 1080p')
  ],

  // Lesson ID validation
  lessonId: [
    param('id')
      .isMongoId()
      .withMessage('Invalid lesson ID')
  ],

  // Get lessons query validation
  getLessonsQuery: [
    param('courseId')
      .isMongoId()
      .withMessage('Invalid course ID'),
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 50 })
      .withMessage('Limit must be between 1 and 50')
  ],

  // Progress update validation
  updateProgress: [
    param('lessonId')
      .isMongoId()
      .withMessage('Invalid lesson ID'),
    body('watchTime')
      .isInt({ min: 0 })
      .withMessage('Watch time must be a non-negative integer (seconds)'),
    body('duration')
      .isInt({ min: 1 })
      .withMessage('Duration must be a positive integer (seconds)')
  ],

  // Reorder lessons validation
  reorderLessons: [
    param('courseId')
      .isMongoId()
      .withMessage('Invalid course ID'),
    body('lessons')
      .isArray({ min: 1 })
      .withMessage('Lessons must be an array with at least one item'),
    body('lessons.*.id')
      .isMongoId()
      .withMessage('Each lesson ID must be a valid MongoDB ObjectId'),
    body('lessons.*.order')
      .isInt({ min: 1 })
      .withMessage('Each lesson order must be a positive integer')
  ]
};

module.exports = lessonValidators;