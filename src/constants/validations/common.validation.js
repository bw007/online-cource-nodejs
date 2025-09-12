module.exports = {
  REQUIRED: (field) => `${field} is required`,
  MIN_LENGTH: (field, min) => `${field} must be at least ${min} characters`,
  MAX_LENGTH: (field, max) => `${field} must be less than ${max} characters`,
  INVALID_ROLE: 'Invalid role',
  INVALID_PROVIDER: 'Invalid provider',
  INVALID_OBJECT_ID: (field) => `${field} must be a valid MongoDB ObjectId`,
  PASSWORD_WEAK: (field) => `${field} must contain at least one lowercase letter, one uppercase letter, and one number`,
  PASSWORD_NOT_MATCH: (field) => `${field} do not match`,
  
  // Course validations
  INVALID_CATEGORY: 'Invalid course category',
  INVALID_PRICE: (field) => `${field} must be a positive number`,
  COURSE_NOT_FOUND: 'Course not found',
  COURSE_ALREADY_PUBLISHED: 'Course is already published',
  INSTRUCTOR_REQUIRED: 'Instructor is required for course creation',
  
  // Lesson validations  
  INVALID_ORDER: 'Lesson order must be a positive number',
  LESSON_NOT_FOUND: 'Lesson not found',
  VIDEO_URL_REQUIRED: 'Video URL is required'
};