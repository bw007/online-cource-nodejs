// src/routes/api/v1/admin.routes.js
const express = require('express');
const { authenticate, requireAdmin, asyncHandler } = require('@/middlewares');
const { 
  courseController, 
  lessonController, 
  sectionController 
} = require('@/controllers');

const router = express.Router();

router.use(authenticate, requireAdmin);

// COURSE MANAGEMENT
router.get('/courses', asyncHandler(courseController.getAdminCourses));
router.post('/courses', asyncHandler(courseController.createCourse));
router.get('/courses/:id', asyncHandler(courseController.getCourseDetail));
router.put('/courses/:id', asyncHandler(courseController.updateCourse));
router.delete('/courses/:id', asyncHandler(courseController.deleteCourse));
router.patch('/courses/:id/publish', asyncHandler(courseController.publishCourse));
router.patch('/courses/:id/unpublish', asyncHandler(courseController.unpublishCourse));

// SECTION MANAGEMENT
router.get('/courses/:courseId/sections', asyncHandler(sectionController.getCourseSections));
router.post('/courses/:courseId/sections', asyncHandler(sectionController.createSection));
router.get('/sections/:id', asyncHandler(sectionController.getSectionDetail));
router.put('/sections/:id', asyncHandler(sectionController.updateSection));
router.delete('/sections/:id', asyncHandler(sectionController.deleteSection));
router.patch('/sections/:id/publish', asyncHandler(sectionController.publishSection));
router.patch('/sections/:id/unpublish', asyncHandler(sectionController.unpublishSection));
router.put('/courses/:courseId/sections/reorder', asyncHandler(sectionController.reorderSections));

// LESSON MANAGEMENT
router.get('/courses/:courseId/lessons', asyncHandler(lessonController.getCourseLessons));
router.get('/courses/:courseId/lessons/grouped', asyncHandler(lessonController.getCourseLessonsGrouped));
router.post('/courses/:courseId/lessons', asyncHandler(lessonController.createLesson));
router.post('/sections/:sectionId/lessons', asyncHandler(lessonController.createLessonInSection));
router.get('/lessons/:id', asyncHandler(lessonController.getLessonDetail));
router.put('/lessons/:id', asyncHandler(lessonController.updateLesson));
router.delete('/lessons/:id', asyncHandler(lessonController.deleteLesson));
router.patch('/lessons/:id/video', asyncHandler(lessonController.updateLessonVideo));
router.patch('/lessons/:id/publish', asyncHandler(lessonController.publishLesson));
router.patch('/lessons/:id/unpublish', asyncHandler(lessonController.unpublishLesson));
router.patch('/lessons/:id/move', asyncHandler(lessonController.moveLesson));
router.put('/courses/:courseId/lessons/reorder', asyncHandler(lessonController.reorderLessons));

module.exports = router;