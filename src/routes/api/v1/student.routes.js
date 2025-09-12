const express = require('express');
const { authenticate, requireStudent, asyncHandler } = require('@/middlewares');
const { studentController } = require('@/controllers');

const router = express.Router();

// Apply student authentication to all routes
router.use(authenticate, requireStudent);

// COURSE ENROLLMENT
router.post('/courses/:courseId/enroll', asyncHandler(studentController.enrollInCourse));
router.delete('/courses/:courseId/enroll', asyncHandler(studentController.unenrollFromCourse));

// MY COURSES
router.get('/my-courses', asyncHandler(studentController.getMyCourses));
router.get('/my-courses/:courseId', asyncHandler(studentController.getEnrolledCourseDetail));

// LESSON ACCESS & PROGRESS
router.get('/lessons/:lessonId', asyncHandler(studentController.getEnrolledLesson));
router.post('/lessons/:lessonId/progress', asyncHandler(studentController.updateLessonProgress));

module.exports = router;