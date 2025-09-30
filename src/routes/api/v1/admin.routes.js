const express = require('express');
const { authenticate, requireAdmin, asyncHandler } = require('@/middlewares');
const { courseController, lessonController } = require('@/controllers');

const router = express.Router();

// Apply admin authentication to all routes
router.use(authenticate, requireAdmin);

// COURSE MANAGEMENT
router.get('/courses', asyncHandler(courseController.getAdminCourses));
router.post('/courses', asyncHandler(courseController.createCourse));
router.get('/courses/:id', asyncHandler(courseController.getCourseDetail));
router.put('/courses/:id', asyncHandler(courseController.updateCourse));
router.delete('/courses/:id', asyncHandler(courseController.deleteCourse));

// COURSE PUBLISH/UNPUBLISH
router.patch('/courses/:id/publish', asyncHandler(courseController.publishCourse));
router.patch('/courses/:id/unpublish', asyncHandler(courseController.unpublishCourse));

// LESSON MANAGEMENT
router.get('/courses/:courseId/lessons', asyncHandler(lessonController.getCourseLessons));
router.post('/courses/:courseId/lessons', asyncHandler(lessonController.createLesson));
router.get('/lessons/:id', asyncHandler(lessonController.getLessonDetail));
router.put('/lessons/:id', asyncHandler(lessonController.updateLesson));
router.delete('/lessons/:id', asyncHandler(lessonController.deleteLesson));

// LESSON VIDEO MANAGEMENT
router.patch('/lessons/:id/video', asyncHandler(lessonController.updateLessonVideo));

// LESSON PUBLISH/UNPUBLISH
router.patch('/lessons/:id/publish', asyncHandler(lessonController.publishLesson));
router.patch('/lessons/:id/unpublish', asyncHandler(lessonController.unpublishLesson));

// LESSON REORDERING
router.put('/courses/:courseId/lessons/reorder', asyncHandler(lessonController.reorderLessons));

module.exports = router;