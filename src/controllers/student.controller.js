// controllers/student.controller.js
const { courseErrors, commonErrors, lessonErrors } = require('@/constants/errors');
const { courseSuccess, commonSuccess } = require('@/constants/success');
const { Course, Lesson, Enrollment, Progress, User } = require('@/models');
const { ResponseFormatter, logger } = require('@/utils');

/**
 * Student Controller
 * Handles student-specific operations: enrollment, progress tracking, my courses
 */
class StudentController {

  /**
   * Enroll student in course
   * Creates enrollment record and updates course stats
   * 
   * @async
   * @param {Object} req - Express request object
   * @param {string} req.params.courseId - Course ID
   * @param {Object} req.user - Authenticated user
   * @param {Object} res - Express response object
   * @returns {Object} JSON response
   */
  async enrollInCourse(req, res) {
    const { courseId } = req.params;
    const studentId = req.user.id;
    
    // Check if course exists and is published
    const course = await Course.findOne({ 
      _id: courseId, 
      isPublished: true 
    });
    
    if (!course) {
      return ResponseFormatter.notFound(res, courseErrors.COURSE_NOT_FOUND);
    }
    
    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      student: studentId,
      course: courseId
    });
    
    if (existingEnrollment) {
      return ResponseFormatter.conflict(res, courseErrors.COURSE_ALREADY_ENROLLED);
    }
    
    // Create enrollment
    const enrollment = await Enrollment.create({
      student: studentId,
      course: courseId
    });
    
    // Update course student count
    await Course.findByIdAndUpdate(courseId, {
      $inc: { studentsCount: 1 }
    });
    
    // Add course to user's enrolled courses
    await User.findByIdAndUpdate(studentId, {
      $addToSet: { enrolledCourses: courseId }
    });
    
    logger.info(`Student ${studentId} enrolled in course ${courseId}`);
    
    return ResponseFormatter.created(res, {
      ...courseSuccess.COURSE_ENROLLED,
      data: { enrollment }
    });
  }

  /**
   * Unenroll student from course
   * Removes enrollment and updates stats
   * 
   * @async
   * @param {Object} req - Express request object
   * @param {string} req.params.courseId - Course ID
   * @param {Object} req.user - Authenticated user
   * @param {Object} res - Express response object
   * @returns {Object} JSON response
   */
  async unenrollFromCourse(req, res) {
    const { courseId } = req.params;
    const studentId = req.user.id;
    
    // Find enrollment
    const enrollment = await Enrollment.findOne({
      student: studentId,
      course: courseId
    });
    
    if (!enrollment) {
      return ResponseFormatter.notFound(res, courseErrors.COURSE_NOT_ENROLLED);
    }
    
    // Delete enrollment and related progress
    await Promise.all([
      Enrollment.findByIdAndDelete(enrollment._id),
      Progress.deleteMany({ student: studentId, course: courseId })
    ]);
    
    // Update course student count
    await Course.findByIdAndUpdate(courseId, {
      $inc: { studentsCount: -1 }
    });
    
    // Remove course from user's enrolled courses
    await User.findByIdAndUpdate(studentId, {
      $pull: { enrolledCourses: courseId }
    });
    
    logger.info(`Student ${studentId} unenrolled from course ${courseId}`);
    
    return ResponseFormatter.success(res, courseSuccess.COURSE_UNENROLLED);
  }

  /**
   * Get student's enrolled courses
   * Returns list of courses with progress
   * 
   * @async
   * @param {Object} req - Express request object
   * @param {Object} req.user - Authenticated user
   * @param {Object} res - Express response object
   * @returns {Object} JSON response with enrolled courses
   */
  async getMyCourses(req, res) {
    const studentId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const enrollments = await Enrollment.find({ student: studentId })
      .populate({
        path: 'course',
        populate: { path: 'lessonsCount' }
      })
      .sort({ enrolledAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Enrollment.countDocuments({ student: studentId });
    
    // Add progress info for each course
    const coursesWithProgress = enrollments.map(enrollment => ({
      enrollment: {
        id: enrollment._id,
        enrolledAt: enrollment.enrolledAt,
        progressPercentage: enrollment.progressPercentage,
        isCompleted: enrollment.isCompleted,
        lastActivityAt: enrollment.lastActivityAt
      },
      course: enrollment.course
    }));
    
    return ResponseFormatter.success(res, {
      ...courseSuccess.COURSES_FETCHED,
      data: {
        courses: coursesWithProgress,
        pagination: {
          current: page,
          total: Math.ceil(total / limit),
          count: enrollments.length,
          totalRecords: total
        }
      }
    });
  }

  /**
   * Get enrolled course details with lessons
   * Shows course content for enrolled student
   * 
   * @async
   * @param {Object} req - Express request object
   * @param {string} req.params.courseId - Course ID
   * @param {Object} req.user - Authenticated user
   * @param {Object} res - Express response object
   * @returns {Object} JSON response with course and lessons
   */
  async getEnrolledCourseDetail(req, res) {
    const { courseId } = req.params;
    const studentId = req.user.id;
    
    // Check enrollment
    const enrollment = await Enrollment.findOne({
      student: studentId,
      course: courseId
    });
    
    if (!enrollment) {
      return ResponseFormatter.forbidden(res, courseErrors.COURSE_NOT_ENROLLED);
    }
    
    // Get course with lessons
    const course = await Course.findById(courseId);
    const lessons = await Lesson.find({ 
      course: courseId,
      isPublished: true 
    }).sort({ order: 1 });
    
    // Get student's progress for each lesson
    const progressMap = {};
    const progresses = await Progress.find({
      student: studentId,
      course: courseId
    });
    
    progresses.forEach(progress => {
      progressMap[progress.lesson.toString()] = progress;
    });
    
    // Add progress info to lessons
    const lessonsWithProgress = lessons.map(lesson => ({
      ...lesson.toObject(),
      progress: progressMap[lesson._id.toString()] || {
        watchTime: 0,
        watchPercentage: 0,
        isCompleted: false
      }
    }));
    
    return ResponseFormatter.success(res, {
      ...courseSuccess.COURSE_FETCHED,
      data: {
        course,
        enrollment: {
          progressPercentage: enrollment.progressPercentage,
          lastWatchedLesson: enrollment.lastWatchedLesson,
          isCompleted: enrollment.isCompleted
        },
        lessons: lessonsWithProgress
      }
    });
  }

  /**
   * Watch lesson and update progress
   * Records video watch progress and completion
   * 
   * @async
   * @param {Object} req - Express request object
   * @param {string} req.params.lessonId - Lesson ID
   * @param {Object} req.body - Request body
   * @param {number} req.body.watchTime - Current watch time in seconds
   * @param {number} req.body.duration - Total lesson duration
   * @param {Object} req.user - Authenticated user
   * @param {Object} res - Express response object
   * @returns {Object} JSON response
   */
  async updateLessonProgress(req, res) {
    const { lessonId } = req.params;
    const { watchTime, duration } = req.body;
    const studentId = req.user.id;
    
    if (!watchTime || !duration) {
      return ResponseFormatter.badRequest(res, {
        message: 'Watch time and duration are required',
        code: 'MISSING_PROGRESS_DATA'
      });
    }
    
    // Get lesson and verify access
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return ResponseFormatter.notFound(res, lessonErrors.LESSON_NOT_FOUND);
    }
    
    // Check if student is enrolled in the course
    const enrollment = await Enrollment.findOne({
      student: studentId,
      course: lesson.course
    });
    
    if (!enrollment) {
      return ResponseFormatter.forbidden(res, courseErrors.COURSE_NOT_ENROLLED);
    }
    
    // Calculate watch percentage
    const watchPercentage = Math.min((watchTime / duration) * 100, 100);
    const isCompleted = watchPercentage >= 90; // 90% completion threshold
    
    // Update or create progress record
    const progressData = {
      student: studentId,
      lesson: lessonId,
      course: lesson.course,
      watchTime,
      watchPercentage,
      isCompleted,
      completedAt: isCompleted ? new Date() : null
    };
    
    const progress = await Progress.findOneAndUpdate(
      { student: studentId, lesson: lessonId },
      progressData,
      { upsert: true, new: true }
    );
    
    // Update enrollment progress if lesson completed
    if (isCompleted) {
      await Enrollment.findByIdAndUpdate(enrollment._id, {
        $addToSet: { completedLessons: lessonId },
        lastWatchedLesson: lessonId,
        lastActivityAt: new Date()
      });
      
      // Calculate overall course progress
      await this.updateCourseProgress(studentId, lesson.course);
    } else {
      // Update last activity
      await Enrollment.findByIdAndUpdate(enrollment._id, {
        lastWatchedLesson: lessonId,
        lastActivityAt: new Date()
      });
    }
    
    logger.info(`Progress updated: Student ${studentId}, Lesson ${lessonId}, ${watchPercentage}%`);
    
    return ResponseFormatter.success(res, {
      message: 'Progress updated successfully',
      data: { progress }
    });
  }

  /**
   * Update overall course progress percentage
   * Helper method to calculate and update course completion
   * 
   * @async
   * @param {string} studentId - Student ID
   * @param {string} courseId - Course ID
   */
  async updateCourseProgress(studentId, courseId) {
    // Get total lessons and completed lessons count
    const totalLessons = await Lesson.countDocuments({ 
      course: courseId,
      isPublished: true 
    });
    
    const completedLessons = await Progress.countDocuments({
      student: studentId,
      course: courseId,
      isCompleted: true
    });
    
    const progressPercentage = totalLessons > 0 ? 
      Math.round((completedLessons / totalLessons) * 100) : 0;
    
    const isCompleted = progressPercentage === 100;
    
    await Enrollment.findOneAndUpdate(
      { student: studentId, course: courseId },
      {
        progressPercentage,
        isCompleted,
        completedAt: isCompleted ? new Date() : null
      }
    );
  }

  /**
   * Get lesson for enrolled student
   * Returns lesson with video access for enrolled students
   * 
   * @async
   * @param {Object} req - Express request object
   * @param {string} req.params.lessonId - Lesson ID
   * @param {Object} req.user - Authenticated user
   * @param {Object} res - Express response object
   * @returns {Object} JSON response with lesson data
   */
  async getEnrolledLesson(req, res) {
    const { lessonId } = req.params;
    const studentId = req.user.id;
    
    const lesson = await Lesson.findOne({
      _id: lessonId,
      isPublished: true
    }).populate('course', 'title');
    
    if (!lesson) {
      return ResponseFormatter.notFound(res, lessonErrors.LESSON_NOT_FOUND);
    }
    
    // Check enrollment or preview access
    let hasAccess = lesson.isPreview;
    
    if (!hasAccess) {
      const enrollment = await Enrollment.findOne({
        student: studentId,
        course: lesson.course._id
      });
      hasAccess = !!enrollment;
    }
    
    if (!hasAccess) {
      return ResponseFormatter.forbidden(res, lessonErrors.LESSON_ACCESS_DENIED);
    }
    
    // Get student's progress for this lesson
    const progress = await Progress.findOne({
      student: studentId,
      lesson: lessonId
    });
    
    const responseData = {
      id: lesson._id,
      title: lesson.title,
      description: lesson.description,
      duration: lesson.duration,
      formattedDuration: lesson.formattedDuration,
      order: lesson.order,
      course: lesson.course,
      video: {
        defaultQuality: lesson.video.defaultQuality,
        availableQualities: Object.keys(lesson.video.qualities),
        videoUrl: lesson.video.qualities[lesson.video.defaultQuality] || lesson.video.originalUrl
      },
      progress: progress ? {
        watchTime: progress.watchTime,
        watchPercentage: progress.watchPercentage,
        isCompleted: progress.isCompleted
      } : {
        watchTime: 0,
        watchPercentage: 0,
        isCompleted: false
      }
    };
    
    return ResponseFormatter.success(res, {
      message: 'Lesson retrieved successfully',
      data: { lesson: responseData }
    });
  }
}

module.exports = new StudentController();