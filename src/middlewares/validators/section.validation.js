const { body, param, query } = require('express-validator');

const sectionValidators = {
  // Create section validation
  createSection: [
    param('courseId')
      .isMongoId()
      .withMessage('Invalid course ID'),
    body('title')
      .isLength({ min: 3, max: 200 })
      .withMessage('Section title must be between 3 and 200 characters')
      .trim(),
    body('description')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Section description must not exceed 1000 characters')
      .trim(),
    body('order')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Section order must be a positive integer')
  ],

  // Update section validation
  updateSection: [
    param('id')
      .isMongoId()
      .withMessage('Invalid section ID'),
    body('title')
      .optional()
      .isLength({ min: 3, max: 200 })
      .withMessage('Section title must be between 3 and 200 characters')
      .trim(),
    body('description')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Section description must not exceed 1000 characters')
      .trim(),
    body('order')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Section order must be a positive integer')
  ],

  // Section ID validation
  sectionId: [
    param('id')
      .isMongoId()
      .withMessage('Invalid section ID')
  ],

  // Course sections validation
  courseSections: [
    param('courseId')
      .isMongoId()
      .withMessage('Invalid course ID')
  ],

  // Delete section validation
  deleteSection: [
    param('id')
      .isMongoId()
      .withMessage('Invalid section ID'),
    query('force')
      .optional()
      .isIn(['true', 'false'])
      .withMessage('Force parameter must be true or false')
  ],

  // Publish section validation
  publishSection: [
    param('id')
      .isMongoId()
      .withMessage('Invalid section ID'),
    query('publishLessons')
      .optional()
      .isIn(['true', 'false'])
      .withMessage('publishLessons parameter must be true or false')
  ],

  // Unpublish section validation
  unpublishSection: [
    param('id')
      .isMongoId()
      .withMessage('Invalid section ID'),
    query('unpublishLessons')
      .optional()
      .isIn(['true', 'false'])
      .withMessage('unpublishLessons parameter must be true or false')
  ],

  // Reorder sections validation
  reorderSections: [
    param('courseId')
      .isMongoId()
      .withMessage('Invalid course ID'),
    body('sectionOrders')
      .isArray({ min: 1 })
      .withMessage('Section orders must be a non-empty array'),
    body('sectionOrders.*.sectionId')
      .isMongoId()
      .withMessage('Invalid section ID in array'),
    body('sectionOrders.*.order')
      .isInt({ min: 1 })
      .withMessage('Order must be a positive integer')
  ]
};

module.exports = sectionValidators;