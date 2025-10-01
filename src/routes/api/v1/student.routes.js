// src/routes/api/v1/student.routes.js
const express = require('express');
const { authenticate, requireStudent, asyncHandler } = require('@/middlewares');
const { studentController } = require('@/controllers');

const router = express.Router();

router.use(authenticate, requireStudent);

// COURSE ENROLLMENT
router.post('/courses/:courseId/enroll', asyncHandler(studentController.enrollInCourse));

// MY COURSES
router.get('/my-courses', asyncHandler(studentController.getMyCourses));
router.get('/my-courses/:courseId', asyncHandler(studentController.getEnrolledCourseDetail));

// LESSON ACCESS
router.get('/lessons/:lessonId', asyncHandler(studentController.getEnrolledLesson));

// COMPLETE LESSON
router.post('/lessons/:lessonId/complete', asyncHandler(studentController.completeLesson));

module.exports = router;