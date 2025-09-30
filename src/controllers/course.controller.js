const { courseErrors, commonErrors } = require('@/constants/errors');
const { ResponseFormatter, logger } = require('@/utils');
const { ROLES } = require('@/constants/enums');
const { Course, Lesson } = require('@/models');
const { courseSuccess } = require('@/constants/success');

/**
 * Course Controller
 * Handles course management operations for admin and public course access for students
 */
class CourseController {

  /**
   * Get all courses for admin dashboard
   * Admin can see all courses with pagination
   * 
   * @async
   * @param {Object} req - Express request object
   * @param {Object} req.query - Query parameters
   * @param {number} req.query.page - Page number (default: 1)
   * @param {number} req.query.limit - Items per page (default: 10)
   * @param {Object} res - Express response object
   * @returns {Object} JSON response with courses list and pagination
   * 
   * @example
   * GET /admin/courses?page=1&limit=10
   * 
   * Success Response:
   * {
   *   "success": true,
   *   "message": "Courses retrieved successfully",
   *   "data": {
   *     "courses": [...],
   *     "pagination": { "current": 1, "total": 5, "count": 10, "totalRecords": 45 }
   *   }
   * }
   */
  async getAdminCourses(req, res) {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const courses = await Course.find()
      .populate('lessonsCount')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Course.countDocuments();
    
    logger.info(`Admin courses retrieved: page ${page}, total ${total}`);
    
    return ResponseFormatter.success(res, {
      ...courseSuccess.COURSES_FETCHED,
      data: {
        courses,
        pagination: {
          current: page,
          total: Math.ceil(total / limit),
          count: courses.length,
          totalRecords: total
        }
      }
    });
  }

  /**
   * Create new course
   * Only admin can create courses
   * 
   * @async
   * @param {Object} req - Express request object
   * @param {Object} req.body - Request body
   * @param {string} req.body.title - Course title
   * @param {string} req.body.description - Course description
   * @param {number} req.body.price - Course price
   * @param {string} req.body.category - Course category
   * @param {string} req.body.thumbnail - Course thumbnail URL
   * @param {Object} req.user - Authenticated user
   * @param {Object} res - Express response object
   * @returns {Object} JSON response with created course
   * 
   * @example
   * POST /admin/courses
   * {
   *   "title": "Node.js Complete Course",
   *   "description": "Learn Node.js from scratch",
   *   "price": 50000,
   *   "category": "Development",
   *   "thumbnail": "https://example.com/image.jpg"
   * }
   */
  async createCourse(req, res) {
    const { title, description, price, category, thumbnail } = req.body;
    
    // Validate required fields
    if (!title || !description) {
      return ResponseFormatter.badRequest(res, courseErrors.MISSING_COURSE_DATA);
    }
    
    // Check if course with same title exists
    const existingCourse = await Course.findOne({ 
      title: { $regex: new RegExp(`^${title}$`, 'i') } 
    });
    
    if (existingCourse) {
      return ResponseFormatter.conflict(res, courseErrors.COURSE_TITLE_EXISTS);
    }
    
    const courseData = {
      title: title.trim(),
      description: description.trim(),
      price: price || 0,
      category,
      thumbnail,
      instructor: req.user.id,
      isPublished: false
    };
    
    const course = await Course.create(courseData);
    
    logger.info(`Course created: ${course._id} by user ${req.user.id}`);
    
    return ResponseFormatter.created(res, {
      ...courseSuccess.COURSE_CREATED,
      data: { course }
    });
  }

  /**
   * Get course detail for admin
   * Returns course info with all lessons
   * 
   * @async
   * @param {Object} req - Express request object
   * @param {string} req.params.id - Course ID
   * @param {Object} res - Express response object
   * @returns {Object} JSON response with course and lessons
   */
  async getCourseDetail(req, res) {
    const course = await Course.findById(req.params.id)
      .populate('lessonsCount');
    
    if (!course) {
      return ResponseFormatter.notFound(res, courseErrors.COURSE_NOT_FOUND);
    }
    
    // Get all lessons for this course
    const lessons = await Lesson.find({ course: course._id })
      .sort({ order: 1 })
      .select('title duration order isPreview isPublished video.defaultQuality createdAt');
    
    logger.info(`Course detail retrieved: ${course._id}`);
    
    return ResponseFormatter.success(res, {
      ...courseSuccess.COURSE_FETCHED,
      data: {
        course,
        lessons
      }
    });
  }

  /**
   * Update course information
   * Only admin can update courses
   * 
   * @async
   * @param {Object} req - Express request object
   * @param {string} req.params.id - Course ID
   * @param {Object} req.body - Updated course data
   * @param {Object} res - Express response object
   * @returns {Object} JSON response with updated course
   */
  async updateCourse(req, res) {
    const { title, description, price, category, thumbnail } = req.body;
    
    // Check if course exists
    const existingCourse = await Course.findById(req.params.id);
    if (!existingCourse) {
      return ResponseFormatter.notFound(res, courseErrors.COURSE_NOT_FOUND);
    }
    
    // Check title uniqueness if title is being changed
    if (title && title !== existingCourse.title) {
      const titleExists = await Course.findOne({ 
        title: { $regex: new RegExp(`^${title}$`, 'i') },
        _id: { $ne: req.params.id }
      });
      
      if (titleExists) {
        return ResponseFormatter.conflict(res, courseErrors.COURSE_TITLE_EXISTS);
      }
    }
    
    const updateData = {};
    if (title) updateData.title = title.trim();
    if (description) updateData.description = description.trim();
    if (price !== undefined) updateData.price = price;
    if (category) updateData.category = category;
    if (thumbnail) updateData.thumbnail = thumbnail;
    
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    logger.info(`Course updated: ${course._id}`);
    
    return ResponseFormatter.success(res, {
      ...courseSuccess.COURSE_UPDATED,
      data: { course }
    });
  }

  /**
   * Publish course
   * Makes course visible to students
   * 
   * @async
   * @param {Object} req - Express request object
   * @param {string} req.params.id - Course ID
   * @param {Object} res - Express response object
   * @returns {Object} JSON response
   */
  async publishCourse(req, res) {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return ResponseFormatter.notFound(res, courseErrors.COURSE_NOT_FOUND);
    }
    
    if (course.isPublished) {
      return ResponseFormatter.badRequest(res, courseErrors.COURSE_ALREADY_PUBLISHED);
    }
    
    // Check if course has at least one published lesson
    const publishedLessonsCount = await Lesson.countDocuments({ 
      course: course._id,
      isPublished: true 
    });
    
    if (publishedLessonsCount === 0) {
      return ResponseFormatter.badRequest(res, courseErrors.NO_PUBLISHED_LESSONS);
    }
    
    course.isPublished = true;
    await course.save();
    
    logger.info(`Course published: ${course._id}`);
    
    return ResponseFormatter.success(res, {
      ...courseSuccess.COURSE_PUBLISHED,
      data: { course }
    });
  }

  /**
   * Unpublish course
   * Hides course from students
   * 
   * @async
   * @param {Object} req - Express request object
   * @param {string} req.params.id - Course ID
   * @param {Object} res - Express response object
   * @returns {Object} JSON response
   */
  async unpublishCourse(req, res) {
    const course = await Course.findByIdAndUpdate(req.params.id,
      { isPublished: false },
      { new: true }
    );
    
    if (!course) {
      return ResponseFormatter.notFound(res, courseErrors.COURSE_NOT_FOUND);
    }
    
    logger.info(`Course unpublished: ${course._id}`);
    
    return ResponseFormatter.success(res, {
      ...courseSuccess.COURSE_UNPUBLISHED,
      data: { course }
    });
  }

  /**
   * Delete course
   * Only allows deletion of unpublished courses
   * 
   * @async
   * @param {Object} req - Express request object
   * @param {string} req.params.id - Course ID
   * @param {Object} res - Express response object
   * @returns {Object} JSON response
   */
  async deleteCourse(req, res) {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return ResponseFormatter.notFound(res, courseErrors.COURSE_NOT_FOUND);
    }
    
    // Check if course is published
    if (course.isPublished) {
      return ResponseFormatter.badRequest(res, courseErrors.CANNOT_DELETE_PUBLISHED_COURSE);
    }
    
    // Check if course has enrolled students
    if (course.studentsCount > 0) {
      return ResponseFormatter.badRequest(res, courseErrors.CANNOT_DELETE_ENROLLED_COURSE);
    }
    
    // Delete all lessons first
    await Lesson.deleteMany({ course: course._id });
    
    // Delete course
    await Course.findByIdAndDelete(course._id);
    
    logger.info(`Course deleted: ${course._id} with all lessons`);
    
    return ResponseFormatter.success(res, courseSuccess.COURSE_DELETED);
  }

  /**
   * Get published courses for students
   * Public endpoint with filtering and search
   * 
   * @async
   * @param {Object} req - Express request object
   * @param {Object} req.query - Query parameters
   * @param {number} req.query.page - Page number
   * @param {number} req.query.limit - Items per page
   * @param {string} req.query.category - Filter by category
   * @param {string} req.query.search - Search in title/description
   * @param {Object} res - Express response object
   * @returns {Object} JSON response with published courses
   */
  async getPublishedCourses(req, res) {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;
    const { category, search } = req.query;
    
    // Build filter
    const filter = { isPublished: true };
    
    if (category) {
      filter.category = category;
    }
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    const courses = await Course.find(filter)
      .populate('lessonsCount')
      .select('title description price thumbnail category studentsCount createdAt instructor')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Course.countDocuments(filter);
    
    return ResponseFormatter.success(res, {
      ...courseSuccess.COURSES_FETCHED,
      data: {
        courses,
        pagination: {
          current: page,
          total: Math.ceil(total / limit),
          count: courses.length,
          totalRecords: total
        }
      }
    });
  }

  /**
   * Get course detail for students
   * Shows only published content
   * 
   * @async
   * @param {Object} req - Express request object
   * @param {string} req.params.id - Course ID
   * @param {Object} res - Express response object
   * @returns {Object} JSON response with course details
   */
  async getCourseDetailForStudent(req, res) {
    const course = await Course.findOne({ 
      _id: req.params.id, 
      isPublished: true 
    }).populate('lessonsCount');
    
    if (!course) {
      return ResponseFormatter.notFound(res, courseErrors.COURSE_NOT_FOUND);
    }
    
    // Get published lessons (preview + enrolled access logic will be handled later)
    const lessons = await Lesson.find({ 
      course: course._id,
      isPublished: true
    })
    .sort({ order: 1 })
    .select('title duration order isPreview');
    
    return ResponseFormatter.success(res, {
      ...courseSuccess.COURSE_FETCHED,
      data: {
        course,
        lessons: lessons.map(lesson => ({
          ...lesson.toObject(),
          hasAccess: lesson.isPreview // For now, only preview lessons are accessible
        }))
      }
    });
  }
}

module.exports = new CourseController();