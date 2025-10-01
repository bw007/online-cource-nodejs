// src/routes/api/v1/public.routes.js
const express = require('express');
const { asyncHandler } = require('@/middlewares');
const { courseController, lessonController } = require('@/controllers');

const router = express.Router();

// PUBLIC COURSE BROWSING
router.get('/courses', asyncHandler(courseController.getPublishedCourses));
router.get('/courses/:id', asyncHandler(courseController.getCourseDetailForStudent));

// PUBLIC LESSON ACCESS (for preview lessons)
router.get('/lessons/:id', asyncHandler(lessonController.getLessonForStudent));

module.exports = router;