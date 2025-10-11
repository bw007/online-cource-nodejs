const express = require('express');
const { authenticate, requireStudent } = require('@/middlewares');
const { asyncHandler } = require('@/middlewares/errors/errorHandler');
const cartController = require('@/controllers/cart.controller');
const { ROLES } = require('@/constants/enums');

const router = express.Router();

router.use(authenticate, requireStudent);

router.get('/', asyncHandler(cartController.getCart));
router.get('/count', asyncHandler(cartController.getCartCount));
router.post('/:courseId', asyncHandler(cartController.addToCart));
router.delete('/:courseId', asyncHandler(cartController.removeFromCart));
router.delete('/', asyncHandler(cartController.clearCart));

module.exports = router;