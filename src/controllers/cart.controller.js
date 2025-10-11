const mongoose = require('mongoose');
const { User, Course } = require('@/models');
const { ResponseFormatter, logger } = require('@/utils');
const { courseErrors } = require('@/constants/errors');

class CartController {

  async addToCart(req, res) {
    const { courseId } = req.params;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return ResponseFormatter.badRequest(res, {
        message: 'Invalid course ID',
        code: 'INVALID_COURSE_ID'
      });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return ResponseFormatter.notFound(res, courseErrors.COURSE_NOT_FOUND);
    }

    if (!course.isPublished) {
      return ResponseFormatter.badRequest(res, {
        message: 'Cannot add unpublished course to cart',
        code: 'COURSE_NOT_PUBLISHED'
      });
    }

    const user = await User.findById(userId);

    // Check if already enrolled
    if (user.enrolledCourses.includes(courseId)) {
      return ResponseFormatter.badRequest(res, {
        message: 'You are already enrolled in this course',
        code: 'ALREADY_ENROLLED'
      });
    }

    // Check if already in cart
    if (user.cart.includes(courseId)) {
      return ResponseFormatter.conflict(res, {
        message: 'Course already in cart',
        code: 'ALREADY_IN_CART'
      });
    }

    user.cart.push(courseId);
    await user.save();

    logger.info(`User ${userId} added course ${courseId} to cart`);

    return ResponseFormatter.success(res, {
      message: 'Course added to cart successfully',
      data: {
        courseId: course._id,
        courseTitle: course.title
      }
    });
  }

  async removeFromCart(req, res) {
    const { courseId } = req.params;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return ResponseFormatter.badRequest(res, {
        message: 'Invalid course ID',
        code: 'INVALID_COURSE_ID'
      });
    }

    const user = await User.findById(userId);
    
    if (!user.cart.includes(courseId)) {
      return ResponseFormatter.notFound(res, {
        message: 'Course not in cart',
        code: 'NOT_IN_CART'
      });
    }

    user.cart = user.cart.filter(id => id.toString() !== courseId);
    await user.save();

    logger.info(`User ${userId} removed course ${courseId} from cart`);

    return ResponseFormatter.success(res, {
      message: 'Course removed from cart successfully',
      data: { courseId }
    });
  }

  async getCart(req, res) {
    const userId = req.user.id;

    const user = await User.findById(userId).populate({
      path: 'cart',
      select: 'title description price thumbnail category isPublished studentsCount instructor',
      match: { isPublished: true },
      populate: {
        path: 'instructor',
        select: 'name email avatar title'
      }
    });

    const cartItems = user.cart.filter(course => course !== null);

    // Calculate total price
    const totalPrice = cartItems.reduce((sum, course) => sum + (course.price || 0), 0);

    logger.info(`User ${userId} retrieved cart with ${cartItems.length} items`);

    return ResponseFormatter.success(res, {
      message: 'Cart retrieved successfully',
      data: {
        cart: cartItems,
        totalItems: cartItems.length,
        totalPrice
      }
    });
  }

  async clearCart(req, res) {
    const userId = req.user.id;

    const user = await User.findById(userId);
    const itemCount = user.cart.length;

    user.cart = [];
    await user.save();

    logger.info(`User ${userId} cleared cart (${itemCount} items removed)`);

    return ResponseFormatter.success(res, {
      message: 'Cart cleared successfully',
      data: {
        itemsRemoved: itemCount
      }
    });
  }

  async getCartCount(req, res) {
    const userId = req.user.id;

    const user = await User.findById(userId).select('cart');
    const count = user.cart.length;

    return ResponseFormatter.success(res, {
      message: 'Cart count retrieved',
      data: { count }
    });
  }
}

module.exports = new CartController();