const { body, param, query } = require('express-validator');

/**
 * Custom validator for video URL
 * Accepts both full URLs and relative paths
 */
const isValidVideoUrl = (value) => {
  if (!value || typeof value !== 'string') {
    throw new Error('Video URL is required');
  }

  // Check if it's a full URL (http:// or https://)
  const isFullUrl = /^https?:\/\/.+/.test(value);
  
  // Check if it's a relative path starting with /uploads/
  const isRelativePath = /^\/uploads\/(videos|thumbnails)\/.+\.(mp4|webm|avi|mov|mkv|jpg|jpeg|png|gif)$/i.test(value);
  
  if (!isFullUrl && !isRelativePath) {
    throw new Error('Invalid video URL format. Must be a full URL (http://...) or relative path (/uploads/videos/...)');
  }
  
  return true;
};

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
      .custom(isValidVideoUrl)
      .withMessage('Original URL must be a valid URL or relative path'),
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
      .custom(isValidVideoUrl)
      .withMessage('360p quality must be a valid URL or relative path'),
    body('qualities.720p')
      .optional()
      .custom(isValidVideoUrl)
      .withMessage('720p quality must be a valid URL or relative path'),
    body('qualities.1080p')
      .optional()
      .custom(isValidVideoUrl)
      .withMessage('1080p quality must be a valid URL or relative path'),
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
    body('lessonOrders')
      .isArray({ min: 1 })
      .withMessage('lessonOrders must be an array with at least one item'),
    body('lessonOrders.*.lessonId')
      .isMongoId()
      .withMessage('Each lesson ID must be a valid MongoDB ObjectId'),
    body('lessonOrders.*.order')
      .isInt({ min: 1 })
      .withMessage('Each lesson order must be a positive integer')
  ]
};

module.exports = lessonValidators;