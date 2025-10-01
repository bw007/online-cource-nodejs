// src/controllers/student.controller.js
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
   */
  async enrollInCourse(req, res) {
    const { courseId } = req.params;
    const studentId = req.user.id;
    
    const course = await Course.findOne({ 
      _id: courseId, 
      isPublished: true 
    });
    
    if (!course) {
      return ResponseFormatter.notFound(res, courseErrors.COURSE_NOT_FOUND);
    }
    
    const existingEnrollment = await Enrollment.findOne({
      student: studentId,
      course: courseId
    });
    
    if (existingEnrollment) {
      return ResponseFormatter.conflict(res, courseErrors.COURSE_ALREADY_ENROLLED);
    }
    
    const enrollment = await Enrollment.create({
      student: studentId,
      course: courseId
    });
    
    await Course.findByIdAndUpdate(courseId, {
      $inc: { studentsCount: 1 }
    });
    
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
   */
  async unenrollFromCourse(req, res) {
    const { courseId } = req.params;
    const studentId = req.user.id;
    
    const enrollment = await Enrollment.findOne({
      student: studentId,
      course: courseId
    });
    
    if (!enrollment) {
      return ResponseFormatter.notFound(res, courseErrors.COURSE_NOT_ENROLLED);
    }
    
    await Promise.all([
      Enrollment.findByIdAndDelete(enrollment._id),
      Progress.deleteMany({ student: studentId, course: courseId })
    ]);
    
    await Course.findByIdAndUpdate(courseId, {
      $inc: { studentsCount: -1 }
    });
    
    await User.findByIdAndUpdate(studentId, {
      $pull: { enrolledCourses: courseId }
    });
    
    logger.info(`Student ${studentId} unenrolled from course ${courseId}`);
    
    return ResponseFormatter.success(res, courseSuccess.COURSE_UNENROLLED);
  }

  /**
   * Get student's enrolled courses
   * Returns list of courses with progress
   */
  async getMyCourses(req, res) {
    const studentId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const enrollments = await Enrollment.find({ student: studentId })
      .populate({
        path: 'course',
        populate: { 
          path: 'instructor',
          select: 'name email'
        }
      })
      .sort({ enrolledAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Enrollment.countDocuments({ student: studentId });
    
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
   */
  async getEnrolledCourseDetail(req, res) {
    const { courseId } = req.params;
    const studentId = req.user.id;
    
    // Check enrollment FIRST
    const enrollment = await Enrollment.findOne({
      student: studentId,
      course: courseId
    });
    
    if (!enrollment) {
      return ResponseFormatter.forbidden(res, courseErrors.COURSE_NOT_ENROLLED);
    }
    
    // Get course with lessons
    const course = await Course.findById(courseId)
      .populate('instructor', 'name email');
      
    if (!course) {
      return ResponseFormatter.notFound(res, courseErrors.COURSE_NOT_FOUND);
    }
    
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
          isCompleted: enrollment.isCompleted,
          enrolledAt: enrollment.enrolledAt
        },
        lessons: lessonsWithProgress
      }
    });
  }

  /**
   * Get lesson for enrolled student
   * Returns lesson with video access ONLY for enrolled students or preview lessons
   * 
   * SECURITY: This is the critical access control point
   */
  async getEnrolledLesson(req, res) {
    const { lessonId } = req.params;
    const studentId = req.user.id;
    
    // Get lesson with course info
    const lesson = await Lesson.findOne({
      _id: lessonId,
      isPublished: true
    }).populate({
      path: 'course',
      select: 'title isPublished', // ← CRITICAL: isPublished MUST be selected
      populate: {
        path: 'instructor',
        select: 'name email'
      }
    });   
    
    if (!lesson) {
      return ResponseFormatter.notFound(res, lessonErrors.LESSON_NOT_FOUND);
    }
    
    if (!lesson.course.isPublished) {
      return ResponseFormatter.notFound(res, courseErrors.COURSE_INACTIVE);
    }
    
    // CRITICAL: Check access permissions
    let hasAccess = false;
    let accessReason = null;
    
    // Option 1: Preview lesson (free access)
    if (lesson.isPreview) {
      hasAccess = true;
      accessReason = 'preview';
    } 
    // Option 2: Enrolled student (paid access)
    else {
      const enrollment = await Enrollment.findOne({
        student: studentId,
        course: lesson.course._id
      });
      
      if (enrollment) {
        hasAccess = true;
        accessReason = 'enrolled';
      }
    }
    
    // DENY ACCESS if not enrolled and not preview
    if (!hasAccess) {
      logger.warn(`Access denied: Student ${studentId} attempted to access lesson ${lessonId} without enrollment`);
      return ResponseFormatter.forbidden(res, {
        message: 'You must enroll in this course to access this lesson',
        code: 'LESSON_ACCESS_DENIED'
      });
    }
    
    // Get student's progress for this lesson
    const progress = await Progress.findOne({
      student: studentId,
      lesson: lessonId
    });
    
    // Prepare response with video URLs (only for enrolled/preview)
    const responseData = {
      id: lesson._id,
      title: lesson.title,
      description: lesson.description,
      duration: lesson.duration,
      formattedDuration: lesson.formattedDuration,
      order: lesson.order,
      isPreview: lesson.isPreview,
      course: lesson.course,
      video: {
        defaultQuality: lesson.video.defaultQuality,
        availableQualities: Object.keys(lesson.video.qualities).filter(
          quality => lesson.video.qualities[quality]
        ),
        videoUrl: lesson.video.qualities[lesson.video.defaultQuality] || 
                  lesson.video.originalUrl
      },
      progress: progress ? {
        watchTime: progress.watchTime,
        watchPercentage: progress.watchPercentage,
        isCompleted: progress.isCompleted
      } : {
        watchTime: 0,
        watchPercentage: 0,
        isCompleted: false
      },
      accessInfo: {
        hasAccess: true,
        reason: accessReason
      }
    };
    
    logger.info(`Lesson accessed: Student ${studentId}, Lesson ${lessonId}, Access: ${accessReason}`);
    
    return ResponseFormatter.success(res, {
      message: 'Lesson retrieved successfully',
      data: { lesson: responseData }
    });
  }

  /**
   * Update lesson progress
   * Records video watch progress and completion
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
    
    // Get lesson and verify it exists
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return ResponseFormatter.notFound(res, lessonErrors.LESSON_NOT_FOUND);
    }
    
    // 🔒 CRITICAL: Check if student is enrolled in the course
    const enrollment = await Enrollment.findOne({
      student: studentId,
      course: lesson.course
    });
    
    if (!enrollment && !lesson.isPreview) {
      logger.warn(`Progress update denied: Student ${studentId} not enrolled in course for lesson ${lessonId}`);
      return ResponseFormatter.forbidden(res, {
        message: 'You must enroll in this course to track progress',
        code: 'COURSE_NOT_ENROLLED'
      });
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
    
    // Update enrollment progress if enrolled (not just preview)
    if (enrollment) {
      if (isCompleted) {
        await Enrollment.findByIdAndUpdate(enrollment._id, {
          $addToSet: { completedLessons: lessonId },
          lastWatchedLesson: lessonId,
          lastActivityAt: new Date()
        });
        
        // Calculate overall course progress
        await this.updateCourseProgress(studentId, lesson.course);
      } else {
        await Enrollment.findByIdAndUpdate(enrollment._id, {
          lastWatchedLesson: lessonId,
          lastActivityAt: new Date()
        });
      }
    }
    
    logger.info(`Progress updated: Student ${studentId}, Lesson ${lessonId}, ${watchPercentage.toFixed(1)}%`);
    
    return ResponseFormatter.success(res, {
      message: 'Progress updated successfully',
      data: { progress }
    });
  }

  /**
   * Update overall course progress percentage
   * Helper method to calculate and update course completion
   */
  async updateCourseProgress(studentId, courseId) {
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
    
    logger.info(`Course progress updated: Student ${studentId}, Course ${courseId}, ${progressPercentage}%`);
  }
}

module.exports = new StudentController();