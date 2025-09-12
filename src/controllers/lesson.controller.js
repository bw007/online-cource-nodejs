const { lessonErrors, courseErrors, commonErrors } = require('@/constants/errors');
const { lessonSuccess, commonSuccess } = require('@/constants/success');
const { Course, Lesson } = require('@/models');
const { ResponseFormatter, logger } = require('@/utils');

/**
 * Lesson Controller
 * Handles lesson management operations for admin and lesson access for students
 */
class LessonController {

  /**
   * Get all lessons for a specific course (Admin)
   * Admin can see all lessons with full details
   * 
   * @async
   * @param {Object} req - Express request object
   * @param {string} req.params.courseId - Course ID
   * @param {Object} req.query - Query parameters
   * @param {number} req.query.page - Page number (default: 1)
   * @param {number} req.query.limit - Items per page (default: 20)
   * @param {Object} res - Express response object
   * @returns {Object} JSON response with lessons list
   * 
   * @example
   * GET /admin/courses/:courseId/lessons?page=1&limit=20
   */
  async getCourseLessons(req, res) {
    const { courseId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    // Verify course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return ResponseFormatter.notFound(res, courseErrors.COURSE_NOT_FOUND);
    }
    
    const lessons = await Lesson.find({ course: courseId })
      .sort({ order: 1 })
      .skip(skip)
      .limit(limit)
      .select('title description duration order isPreview isPublished video.defaultQuality createdAt');
    
    const total = await Lesson.countDocuments({ course: courseId });
    
    logger.info(`Course lessons retrieved: course ${courseId}, total ${total}`);
    
    return ResponseFormatter.success(res, {
      ...lessonSuccess.LESSONS_FETCHED,
      data: {
        lessons,
        course: {
          id: course._id,
          title: course.title
        },
        pagination: {
          current: page,
          total: Math.ceil(total / limit),
          count: lessons.length,
          totalRecords: total
        }
      }
    });
  }

  /**
   * Create new lesson with hybrid order mechanism
   * Admin can specify order manually or let system auto-assign
   * 
   * @async
   * @param {Object} req - Express request object
   * @param {string} req.params.courseId - Course ID
   * @param {Object} req.body - Request body
   * @param {string} req.body.title - Lesson title
   * @param {string} req.body.description - Lesson description
   * @param {string} req.body.originalUrl - Original video URL
   * @param {number} req.body.duration - Lesson duration in seconds
   * @param {number} [req.body.order] - Lesson order in course (optional - auto-assigned if not provided)
   * @param {boolean} req.body.isPreview - Is preview lesson
   * @param {Object} req.user - Authenticated user
   * @param {Object} res - Express response object
   * @returns {Object} JSON response with created lesson
   * 
   * @example
   * POST /admin/courses/:courseId/lessons
   * 
   * Manual Order:
   * {
   *   "title": "Introduction to Node.js",
   *   "description": "Basic concepts of Node.js",
   *   "originalUrl": "https://videos.com/lesson1.mp4",
   *   "duration": 1800,
   *   "order": 1,
   *   "isPreview": true
   * }
   * 
   * Auto Order (order field omitted):
   * {
   *   "title": "Advanced Node.js",
   *   "description": "Advanced concepts",
   *   "originalUrl": "https://videos.com/lesson2.mp4",
   *   "duration": 2400,
   *   "isPreview": false
   * }
   */
  async createLesson(req, res) {
    const { courseId } = req.params;
    const { title, description, originalUrl, duration, order: requestedOrder, isPreview } = req.body;
    
    // Validate required fields (order is now optional)
    if (!title || !originalUrl || !duration) {
      return ResponseFormatter.badRequest(res, {
        ...lessonErrors.MISSING_LESSON_DATA,
        requiredFields: ['title', 'originalUrl', 'duration']
      });
    }
    
    // Verify course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return ResponseFormatter.notFound(res, courseErrors.COURSE_NOT_FOUND);
    }
    
    let finalOrder;
    
    if (requestedOrder) {
      // Manual Order: Admin specified order
      finalOrder = parseInt(requestedOrder);
      
      // Validate order is positive
      if (finalOrder < 1) {
        return ResponseFormatter.badRequest(res, {
          ...lessonErrors.INVALID_LESSON_ORDER,
          providedOrder: finalOrder
        });
      }
      
      // Check if lesson with same order already exists
      const existingLesson = await Lesson.findOne({ 
        course: courseId,
        order: finalOrder
      });
      
      if (existingLesson) {
        return ResponseFormatter.conflict(res, {
          message: `Lesson order ${finalOrder} already exists in this course`,
          code: 'LESSON_ORDER_EXISTS',
          conflictingOrder: finalOrder,
          existingLessonId: existingLesson._id,
          existingLessonTitle: existingLesson.title,
          suggestion: 'Either choose a different order number or omit the order field for auto-assignment'
        });
      }
      
      logger.info(`Manual order assigned: ${finalOrder} for lesson in course ${courseId}`);
      
    } else {
      // Auto Order: System assigns next available order
      const lastLesson = await Lesson.findOne({ course: courseId })
        .sort({ order: -1 })
        .select('order');
      
      finalOrder = lastLesson ? lastLesson.order + 1 : 1;
      
      logger.info(`Auto order assigned: ${finalOrder} for lesson in course ${courseId}`);
    }
    
    const lessonData = {
      title: title.trim(),
      description: description?.trim() || '',
      course: courseId,
      video: {
        originalUrl: originalUrl.trim(),
        defaultQuality: '720p',
        qualities: {
          '720p': originalUrl.trim() // Initially same as original, will be updated when processed
        }
      },
      duration: parseInt(duration),
      order: finalOrder,
      isPreview: Boolean(isPreview),
      isPublished: false
    };
    
    const lesson = await Lesson.create(lessonData);
    
    // Populate course info for response
    await lesson.populate('course', 'title');
    
    logger.info(`Lesson created successfully: ${lesson._id} (order: ${finalOrder}) in course ${courseId} by user ${req.user.id}`);
    
    return ResponseFormatter.created(res, {
      ...lessonSuccess.LESSON_CREATED,
      data: { 
        lesson,
        orderInfo: {
          assigned: finalOrder,
          method: requestedOrder ? 'manual' : 'auto',
          totalLessonsInCourse: finalOrder
        }
      }
    });
  }

  /**
   * Get lesson detail for admin
   * Returns full lesson information including video qualities
   * 
   * @async
   * @param {Object} req - Express request object
   * @param {string} req.params.id - Lesson ID
   * @param {Object} res - Express response object
   * @returns {Object} JSON response with lesson details
   */
  async getLessonDetail(req, res) {
    const lesson = await Lesson.findById(req.params.id)
      .populate('course', 'title instructor');
    
    if (!lesson) {
      return ResponseFormatter.notFound(res, lessonErrors.LESSON_NOT_FOUND);
    }
    
    logger.info(`Lesson detail retrieved: ${lesson._id}`);
    
    return ResponseFormatter.success(res, {
      ...lessonSuccess.LESSON_FETCHED,
      data: { lesson }
    });
  }

  /**
   * Update lesson information
   * Only admin can update lessons
   * 
   * @async
   * @param {Object} req - Express request object
   * @param {string} req.params.id - Lesson ID
   * @param {Object} req.body - Updated lesson data
   * @param {Object} res - Express response object
   * @returns {Object} JSON response with updated lesson
   */
  async updateLesson(req, res) {
    const { title, description, duration, order, isPreview } = req.body;
    
    // Check if lesson exists
    const existingLesson = await Lesson.findById(req.params.id);
    if (!existingLesson) {
      return ResponseFormatter.notFound(res, lessonErrors.LESSON_NOT_FOUND);
    }
    
    // Check order uniqueness if order is being changed
    if (order && order !== existingLesson.order) {
      const orderExists = await Lesson.findOne({ 
        course: existingLesson.course,
        order: order,
        _id: { $ne: req.params.id }
      });
      
      if (orderExists) {
        return ResponseFormatter.conflict(res, {
          ...lessonErrors.LESSON_ORDER_EXISTS,
          order: order
        });
      }
    }
    
    const updateData = {};
    if (title) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description?.trim();
    if (duration) updateData.duration = parseInt(duration);
    if (order) updateData.order = parseInt(order);
    if (isPreview !== undefined) updateData.isPreview = Boolean(isPreview);
    
    const lesson = await Lesson.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    logger.info(`Lesson updated: ${lesson._id}`);
    
    return ResponseFormatter.success(res, {
      ...lessonSuccess.LESSON_UPDATED,
      data: { lesson }
    });
  }

  /**
   * Update lesson video qualities
   * Updates processed video URLs for different qualities
   * 
   * @async
   * @param {Object} req - Express request object
   * @param {string} req.params.id - Lesson ID
   * @param {Object} req.body - Video quality data
   * @param {Object} req.body.qualities - Quality URLs object
   * @param {string} req.body.defaultQuality - Default quality setting
   * @param {Object} res - Express response object
   * @returns {Object} JSON response
   */
  async updateLessonVideo(req, res) {
    const { qualities, defaultQuality } = req.body;
    
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) {
      return ResponseFormatter.notFound(res, lessonErrors.LESSON_NOT_FOUND);
    }
    
    const updateData = {};
    
    if (qualities) {
      updateData['video.qualities'] = {
        ...lesson.video.qualities,
        ...qualities
      };
    }
    
    if (defaultQuality && ['360p', '720p', '1080p'].includes(defaultQuality)) {
      updateData['video.defaultQuality'] = defaultQuality;
    }
    
    const updatedLesson = await Lesson.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    logger.info(`Lesson video updated: ${lesson._id}`);
    
    return ResponseFormatter.success(res, {
      ...lessonSuccess.LESSON_VIDEO_UPDATED,
      data: { lesson: updatedLesson }
    });
  }

  /**
   * Publish lesson
   * Makes lesson visible to students
   * 
   * @async
   * @param {Object} req - Express request object
   * @param {string} req.params.id - Lesson ID
   * @param {Object} res - Express response object
   * @returns {Object} JSON response
   */
  async publishLesson(req, res) {
    const lesson = await Lesson.findById(req.params.id);
    
    if (!lesson) {
      return ResponseFormatter.notFound(res, lessonErrors.LESSON_NOT_FOUND);
    }
    
    if (lesson.isPublished) {
      return ResponseFormatter.badRequest(res, lessonErrors.LESSON_ALREADY_PUBLISHED);
    }
    
    // Check if lesson has at least one video quality
    const hasVideo = lesson.video.originalUrl || 
                    lesson.video.qualities['360p'] || 
                    lesson.video.qualities['720p'] || 
                    lesson.video.qualities['1080p'];
    
    if (!hasVideo) {
      return ResponseFormatter.badRequest(res, lessonErrors.NO_VIDEO_AVAILABLE);
    }
    
    lesson.isPublished = true;
    await lesson.save();
    
    logger.info(`Lesson published: ${lesson._id}`);
    
    return ResponseFormatter.success(res, {
      ...lessonSuccess.LESSON_PUBLISHED,
      data: { lesson }
    });
  }

  /**
   * Unpublish lesson
   * Hides lesson from students
   * 
   * @async
   * @param {Object} req - Express request object
   * @param {string} req.params.id - Lesson ID
   * @param {Object} res - Express response object
   * @returns {Object} JSON response
   */
  async unpublishLesson(req, res) {
    const lesson = await Lesson.findByIdAndUpdate(
      req.params.id,
      { isPublished: false },
      { new: true }
    );
    
    if (!lesson) {
      return ResponseFormatter.notFound(res, lessonErrors.LESSON_NOT_FOUND);
    }
    
    logger.info(`Lesson unpublished: ${lesson._id}`);
    
    return ResponseFormatter.success(res, {
      ...lessonSuccess.LESSON_UNPUBLISHED,
      data: { lesson }
    });
  }

  /**
   * Delete lesson
   * Only allows deletion of unpublished lessons
   * 
   * @async
   * @param {Object} req - Express request object
   * @param {string} req.params.id - Lesson ID
   * @param {Object} res - Express response object
   * @returns {Object} JSON response
   */
  async deleteLesson(req, res) {
    const lesson = await Lesson.findById(req.params.id);
    
    if (!lesson) {
      return ResponseFormatter.notFound(res, lessonErrors.LESSON_NOT_FOUND);
    }
    
    // Check if lesson is published
    if (lesson.isPublished) {
      return ResponseFormatter.badRequest(res, lessonErrors.CANNOT_DELETE_PUBLISHED_LESSON);
    }
    
    // Delete lesson
    await Lesson.findByIdAndDelete(lesson._id);
    
    logger.info(`Lesson deleted: ${lesson._id} from course ${lesson.course}`);
    
    return ResponseFormatter.success(res, {
      ...lessonSuccess.LESSON_DELETED,
      message: 'Lesson deleted successfully'
    });
  }

  /**
   * Get lesson for student viewing
   * Checks access permissions and returns appropriate video quality
   * 
   * @async
   * @param {Object} req - Express request object
   * @param {string} req.params.id - Lesson ID
   * @param {Object} req.user - Authenticated user (optional)
   * @param {Object} res - Express response object
   * @returns {Object} JSON response with lesson data
   */
  async getLessonForStudent(req, res) {
    const lesson = await Lesson.findOne({
      _id: req.params.id,
      isPublished: true
    }).populate('course', 'title isPublished');
    
    if (!lesson) {
      return ResponseFormatter.notFound(res, lessonErrors.LESSON_NOT_FOUND);
    }
    
    if (!lesson.course.isPublished) {
      return ResponseFormatter.notFound(res, courseErrors.COURSE_INACTIVE);
    }
    
    // Check access permissions
    const hasAccess = lesson.isPreview; // For now, only preview lessons
    // TODO: Add enrollment check when enrollment system is implemented
    
    if (!hasAccess) {
      return ResponseFormatter.forbidden(res, lessonErrors.LESSON_ACCESS_DENIED);
    }
    
    // Prepare video data based on access
    const videoData = {
      defaultQuality: lesson.video.defaultQuality,
      availableQualities: Object.keys(lesson.video.qualities)
        .filter(quality => lesson.video.qualities[quality])
    };
    
    if (hasAccess) {
      videoData.videoUrl = lesson.video.qualities[lesson.video.defaultQuality] || 
                          lesson.video.originalUrl;
      videoData.qualities = lesson.video.qualities;
    }
    
    const responseData = {
      id: lesson._id,
      title: lesson.title,
      description: lesson.description,
      duration: lesson.duration,
      formattedDuration: lesson.formattedDuration,
      order: lesson.order,
      isPreview: lesson.isPreview,
      hasAccess: hasAccess,
      video: videoData,
      course: {
        id: lesson.course._id,
        title: lesson.course.title
      }
    };
    
    logger.info(`Lesson accessed by student: ${lesson._id}, access: ${hasAccess}`);
    
    return ResponseFormatter.success(res, {
      ...lessonSuccess.LESSON_FETCHED,
      data: { lesson: responseData }
    });
  }

  /**
   * Reorder lessons in a course
   * Updates order of multiple lessons at once
   * 
   * @async
   * @param {Object} req - Express request object
   * @param {string} req.params.courseId - Course ID
   * @param {Object} req.body - Request body
   * @param {Array} req.body.lessons - Array of {id, order} objects
   * @param {Object} res - Express response object
   * @returns {Object} JSON response
   * 
   * @example
   * PUT /admin/courses/:courseId/lessons/reorder
   * {
   *   "lessons": [
   *     {"id": "lesson1_id", "order": 1},
   *     {"id": "lesson2_id", "order": 2},
   *     {"id": "lesson3_id", "order": 3}
   *   ]
   * }
   */
  async reorderLessons(req, res) {
    const { courseId } = req.params;
    const { lessons } = req.body;
    
    if (!Array.isArray(lessons) || lessons.length === 0) {
      return ResponseFormatter.badRequest(res, {
        message: 'Lessons array is required',
        code: 'MISSING_LESSONS_DATA'
      });
    }
    
    // Verify course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return ResponseFormatter.notFound(res, courseErrors.COURSE_NOT_FOUND);
    }
    
    // Update lessons in parallel
    const updatePromises = lessons.map(({ id, order }) => 
      Lesson.findOneAndUpdate(
        { _id: id, course: courseId },
        { order: parseInt(order) },
        { new: true, runValidators: true }
      )
    );
    
    const updatedLessons = await Promise.all(updatePromises);
    
    // Check if all lessons were found and updated
    const notFound = updatedLessons.filter(lesson => !lesson);
    if (notFound.length > 0) {
      return ResponseFormatter.badRequest(res, {
        message: 'Some lessons not found or not in this course',
        code: 'INVALID_LESSON_IDS'
      });
    }
    
    logger.info(`Lessons reordered in course: ${courseId}, count: ${lessons.length}`);
    
    return ResponseFormatter.success(res, {
      ...lessonSuccess.LESSONS_REORDERED,
      data: {
        updatedCount: updatedLessons.length,
        lessons: updatedLessons.sort((a, b) => a.order - b.order)
      }
    });
  }
}

module.exports = new LessonController();