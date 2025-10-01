const express = require('express');
const { 
  authenticate, 
  requireAdmin, 
  asyncHandler 
} = require('@/middlewares');

const { section: sectionValidation } = require('@/middlewares/validators');
const handleValidationErrors = require('@/middlewares/shared/handleValidationErrors');

const { 
  courseController, 
  lessonController, 
  sectionController 
} = require('@/controllers');

const router = express.Router();

// Apply authentication to all admin routes
router.use(authenticate, requireAdmin);

// ============================================
// COURSE MANAGEMENT
// ============================================
router.get('/courses', asyncHandler(courseController.getAdminCourses));
router.post('/courses', asyncHandler(courseController.createCourse));
router.get('/courses/:id', asyncHandler(courseController.getCourseDetail));
router.put('/courses/:id', asyncHandler(courseController.updateCourse));
router.delete('/courses/:id', asyncHandler(courseController.deleteCourse));
router.patch('/courses/:id/publish', asyncHandler(courseController.publishCourse));
router.patch('/courses/:id/unpublish', asyncHandler(courseController.unpublishCourse));

// ============================================
// SECTION MANAGEMENT
// ============================================

// Get all sections for a course
router.get(
  '/courses/:courseId/sections', 
  sectionValidation.courseSections,
  handleValidationErrors,
  asyncHandler(sectionController.getCourseSections)
);

// Create new section
router.post(
  '/courses/:courseId/sections', 
  sectionValidation.createSection,
  handleValidationErrors,
  asyncHandler(sectionController.createSection)
);

// Get section detail with lessons
router.get(
  '/sections/:id', 
  sectionValidation.sectionId,
  handleValidationErrors,
  asyncHandler(sectionController.getSectionDetail)
);

// Update section
router.put(
  '/sections/:id', 
  sectionValidation.updateSection,
  handleValidationErrors,
  asyncHandler(sectionController.updateSection)
);

// Delete section
router.delete(
  '/sections/:id', 
  sectionValidation.deleteSection,
  handleValidationErrors,
  asyncHandler(sectionController.deleteSection)
);

// Publish section
router.patch(
  '/sections/:id/publish', 
  sectionValidation.publishSection,
  handleValidationErrors,
  asyncHandler(sectionController.publishSection)
);

// Unpublish section
router.patch(
  '/sections/:id/unpublish', 
  sectionValidation.unpublishSection,
  handleValidationErrors,
  asyncHandler(sectionController.unpublishSection)
);

// Reorder sections
router.put(
  '/courses/:courseId/sections/reorder', 
  sectionValidation.reorderSections,
  handleValidationErrors,
  asyncHandler(sectionController.reorderSections)
);

// ============================================
// LESSON MANAGEMENT
// ============================================

// Get all lessons for a course (flat list)
router.get('/courses/:courseId/lessons', asyncHandler(lessonController.getCourseLessons));

// Get lessons grouped by sections
router.get('/courses/:courseId/lessons/grouped', asyncHandler(lessonController.getCourseLessonsGrouped));

// Create lesson (without section - loose lesson)
router.post('/courses/:courseId/lessons', asyncHandler(lessonController.createLesson));

// Create lesson in specific section
router.post('/sections/:sectionId/lessons', asyncHandler(lessonController.createLessonInSection));

// Get lesson detail
router.get('/lessons/:id', asyncHandler(lessonController.getLessonDetail));

// Update lesson
router.put('/lessons/:id', asyncHandler(lessonController.updateLesson));

// Delete lesson
router.delete('/lessons/:id', asyncHandler(lessonController.deleteLesson));

// Update lesson video
router.patch('/lessons/:id/video', asyncHandler(lessonController.updateLessonVideo));

// Publish lesson
router.patch('/lessons/:id/publish', asyncHandler(lessonController.publishLesson));

// Unpublish lesson
router.patch('/lessons/:id/unpublish', asyncHandler(lessonController.unpublishLesson));

// Move lesson to another section or remove from section
router.patch('/lessons/:id/move', asyncHandler(lessonController.moveLesson));

// Reorder lessons within a course
router.put('/courses/:courseId/lessons/reorder', asyncHandler(lessonController.reorderLessons));

module.exports = router;