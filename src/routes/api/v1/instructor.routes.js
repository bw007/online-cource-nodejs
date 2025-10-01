const express = require('express');
const { authenticate, requireAdmin, asyncHandler } = require('@/middlewares');
const { instructorController } = require('@/controllers');

const router = express.Router();

router.use(authenticate, requireAdmin);

// INSTRUCTOR MANAGEMENT
router.get('/', asyncHandler(instructorController.getAllInstructors));
router.post('/', asyncHandler(instructorController.createInstructor));
router.get('/:id', asyncHandler(instructorController.getInstructorDetail));
router.put('/:id', asyncHandler(instructorController.updateInstructor));
router.delete('/:id', asyncHandler(instructorController.deleteInstructor));

module.exports = router;