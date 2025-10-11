const express = require('express');
const { authenticate, requireStudent } = require('@/middlewares');
const { asyncHandler } = require('@/middlewares/errors/errorHandler');
const favouriteController = require('@/controllers/favourite.controller');

const router = express.Router();

router.use(authenticate, requireStudent);

router.get('/', asyncHandler(favouriteController.getFavourites));

router.get('/check/:courseId', asyncHandler(favouriteController.checkFavourite));

router.post('/:courseId', asyncHandler(favouriteController.addToFavourites));

router.delete('/:courseId', asyncHandler(favouriteController.removeFromFavourites));

router.patch('/toggle/:courseId', asyncHandler(favouriteController.toggleFavourite));

module.exports = router;