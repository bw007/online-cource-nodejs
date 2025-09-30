const { body, param, query } = require('express-validator');
const { COURSE_CATEGORY_VALUES } = require('@/constants/enums');

const courseValidators = {
  // Create course validation
  createCourse: [
    body('title')
      .isLength({ min: 1, max: 100 })
      .withMessage('Course title must be between 1 and 100 characters')
      .trim(),
    body('description')
      .isLength({ min: 1, max: 1000 })
      .withMessage('Course description must be between 1 and 1000 characters')
      .trim(),
    body('price')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Course price must be a positive number'),
    body('category')
      .optional()
      .isIn(COURSE_CATEGORY_VALUES)
      .withMessage(`Category must be one of: ${COURSE_CATEGORY_VALUES.join(', ')}`),
    body('thumbnail')
      .optional()
      .isURL()
      .withMessage('Thumbnail must be a valid URL')
  ],

  // Update course validation
  updateCourse: [
    param('id')
      .isMongoId()
      .withMessage('Invalid course ID'),
    body('title')
      .optional()
      .isLength({ min: 1, max: 100 })
      .withMessage('Course title must be between 1 and 100 characters')
      .trim(),
    body('description')
      .optional()
      .isLength({ min: 1, max: 1000 })
      .withMessage('Course description must be between 1 and 1000 characters')
      .trim(),
    body('price')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Course price must be a positive number'),
    body('category')
      .optional()
      .isIn(COURSE_CATEGORY_VALUES)
      .withMessage(`Category must be one of: ${COURSE_CATEGORY_VALUES.join(', ')}`),
    body('thumbnail')
      .optional()
      .isURL()
      .withMessage('Thumbnail must be a valid URL')
  ],

  // Course ID validation
  courseId: [
    param('id')
      .isMongoId()
      .withMessage('Invalid course ID')
  ],

  // Get courses query validation
  getCoursesQuery: [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 50 })
      .withMessage('Limit must be between 1 and 50'),
    query('category')
      .optional()
      .isIn(COURSE_CATEGORY_VALUES)
      .withMessage(`Category must be one of: ${COURSE_CATEGORY_VALUES.join(', ')}`),
    query('search')
      .optional()
      .isLength({ min: 1, max: 100 })
      .withMessage('Search query must be between 1 and 100 characters')
      .trim()
  ],

  // Enrollment validation
  enrollment: [
    param('courseId')
      .isMongoId()
      .withMessage('Invalid course ID')
  ]
};

module.exports = courseValidators;