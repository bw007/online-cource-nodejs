const mongoose = require('mongoose');
const { User, Course } = require('@/models');
const { ResponseFormatter, logger } = require('@/utils');
const { courseErrors, commonErrors } = require('@/constants/errors');

class FavouriteController {

  async addToFavourites(req, res) {
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
        message: 'Cannot add unpublished course to favourites',
        code: 'COURSE_NOT_PUBLISHED'
      });
    }

    const user = await User.findById(userId);
    
    if (user.favouriteCourses.includes(courseId)) {
      return ResponseFormatter.conflict(res, {
        message: 'Course already in favourites',
        code: 'ALREADY_IN_FAVOURITES'
      });
    }

    user.favouriteCourses.push(courseId);
    await user.save();

    logger.info(`User ${userId} added course ${courseId} to favourites`);

    return ResponseFormatter.success(res, {
      message: 'Course added to favourites successfully',
      data: {
        courseId: course._id,
        courseTitle: course.title
      }
    });
  }

  async removeFromFavourites(req, res) {
    const { courseId } = req.params;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return ResponseFormatter.badRequest(res, {
        message: 'Invalid course ID',
        code: 'INVALID_COURSE_ID'
      });
    }

    const user = await User.findById(userId);
    
    if (!user.favouriteCourses.includes(courseId)) {
      return ResponseFormatter.notFound(res, {
        message: 'Course not in favourites',
        code: 'NOT_IN_FAVOURITES'
      });
    }

    user.favouriteCourses = user.favouriteCourses.filter(
      id => id.toString() !== courseId
    );
    await user.save();

    logger.info(`User ${userId} removed course ${courseId} from favourites`);

    return ResponseFormatter.success(res, {
      message: 'Course removed from favourites successfully',
      data: { courseId }
    });
  }

  async getFavourites(req, res) {
    const userId = req.user.id;

    const user = await User.findById(userId).populate({
      path: 'favouriteCourses',
      select: 'title description price thumbnail category isPublished studentsCount instructor createdAt',
      match: { isPublished: true },
      populate: {
        path: 'instructor',
        select: 'name email avatar title'
      }
    });

    const favourites = user.favouriteCourses.filter(course => course !== null);

    logger.info(`User ${userId} retrieved ${favourites.length} favourite courses`);

    return ResponseFormatter.success(res, {
      message: 'Favourite courses retrieved successfully',
      data: {
        favourites,
        totalCount: favourites.length
      }
    });
  }

  async checkFavourite(req, res) {
    const { courseId } = req.params;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return ResponseFormatter.badRequest(res, {
        message: 'Invalid course ID',
        code: 'INVALID_COURSE_ID'
      });
    }

    const user = await User.findById(userId);
    const isFavourite = user.favouriteCourses.some(
      id => id.toString() === courseId
    );

    return ResponseFormatter.success(res, {
      message: 'Favourite status checked',
      data: {
        courseId,
        isFavourite
      }
    });
  }

  async toggleFavourite(req, res) {
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
        message: 'Cannot add unpublished course to favourites',
        code: 'COURSE_NOT_PUBLISHED'
      });
    }

    const user = await User.findById(userId);
    const isFavourite = user.favouriteCourses.some(
      id => id.toString() === courseId
    );

    if (isFavourite) {
      user.favouriteCourses = user.favouriteCourses.filter(
        id => id.toString() !== courseId
      );
      await user.save();

      logger.info(`User ${userId} removed course ${courseId} from favourites (toggle)`);

      return ResponseFormatter.success(res, {
        message: 'Course removed from favourites',
        data: {
          courseId,
          isFavourite: false
        }
      });
    } else {
      user.favouriteCourses.push(courseId);
      await user.save();

      logger.info(`User ${userId} added course ${courseId} to favourites (toggle)`);

      return ResponseFormatter.success(res, {
        message: 'Course added to favourites',
        data: {
          courseId,
          isFavourite: true,
          courseTitle: course.title
        }
      });
    }
  }
}

module.exports = new FavouriteController();