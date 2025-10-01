// src/controllers/student.controller.js
const { courseErrors, lessonErrors } = require('@/constants/errors');
const { courseSuccess } = require('@/constants/success');
const { Course, Lesson, Enrollment, Progress, User, Section } = require('@/models');
const { ResponseFormatter, logger } = require('@/utils');

class StudentController {

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
        completedLessonsCount: enrollment.completedLessonsCount,
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
   * Get enrolled course detail with completion status
   * SIMPLIFIED: Only shows isCompleted for each lesson
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
      return ResponseFormatter.notFound(res, courseErrors.COURSE_NOT_ENROLLED);
    }
    
    // Get course details
    const course = await Course.findOne({
      _id: courseId,
      isPublished: true
    }).populate('instructor', 'name email');
    
    if (!course) {
      return ResponseFormatter.notFound(res, courseErrors.COURSE_NOT_FOUND);
    }
    
    // Get published sections with lessons
    const sections = await Section.find({
      course: course._id,
      isPublished: true
    })
    .sort({ order: 1 })
    .lean();
    
    // Add lessons to each section
    for (let section of sections) {
      section.lessons = await Lesson.find({
        section: section._id,
        isPublished: true
      })
      .sort({ order: 1 })
      .select('title description duration isPreview order video.originalUrl video.defaultQuality')
      .lean();
    }
    
    // Get loose lessons (not in any section)
    const looseLessons = await Lesson.find({
      course: course._id,
      section: null,
      isPublished: true
    })
    .sort({ order: 1 })
    .select('title description duration isPreview order video.originalUrl video.defaultQuality')
    .lean();
    
    logger.info(`Enrolled course detail retrieved: ${courseId} by student ${studentId}`);
    
    return ResponseFormatter.success(res, {
      message: 'Enrolled course details retrieved successfully',
      data: { 
        course,
        sections,
        looseLessons,
        enrollment
      }
    });
  }

  /**
   * Get lesson with completion status
   * SIMPLIFIED: Only returns isCompleted
   */
  async getEnrolledLesson(req, res) {
    const { lessonId } = req.params;
    const studentId = req.user.id;
    
    const lesson = await Lesson.findOne({
      _id: lessonId,
      isPublished: true
    }).populate('course', 'title isPublished');
    
    if (!lesson) {
      return ResponseFormatter.notFound(res, lessonErrors.LESSON_NOT_FOUND);
    }
    
    if (!lesson.course.isPublished) {
      return ResponseFormatter.notFound(res, courseErrors.COURSE_NOT_FOUND);
    }
    
    const courseId = lesson.course._id;
    
    // Check enrollment or preview
    const enrollment = await Enrollment.findOne({
      student: studentId,
      course: courseId
    });
    
    if (!enrollment && !lesson.isPreview) {
      return ResponseFormatter.forbidden(res, {
        message: 'Access denied. Enroll in course to watch this lesson.',
        code: 'ENROLLMENT_REQUIRED'
      });
    }
    
    // Get completion status (simple)
    const progress = await Progress.findOne({
      student: studentId,
      course: courseId,
      lesson: lessonId
    });
    
    const responseData = {
      id: lesson._id,
      title: lesson.title,
      description: lesson.description,
      duration: lesson.duration,
      order: lesson.order,
      isPreview: lesson.isPreview,
      video: {
        defaultQuality: lesson.video.defaultQuality,
        videoUrl: lesson.video.originalUrl
      },
      isCompleted: progress ? progress.isCompleted : false,
      completedAt: progress ? progress.completedAt : null
    };
    
    logger.info(`Lesson accessed: Student ${studentId}, Lesson ${lessonId}`);
    
    return ResponseFormatter.success(res, {
      message: 'Lesson retrieved successfully',
      data: { lesson: responseData }
    });
  }

  /**
   * Complete lesson (SIMPLIFIED)
   * Mark lesson as completed and update course progress
   */
  async completeLesson(req, res) {
    const { lessonId } = req.params;
    const studentId = req.user.id;
    
    const lesson = await Lesson.findOne({
      _id: lessonId,
      isPublished: true
    }).populate('course');
    
    if (!lesson) {
      return ResponseFormatter.notFound(res, lessonErrors.LESSON_NOT_FOUND);
    }
    
    const courseId = lesson.course._id;
    
    // Check enrollment
    const enrollment = await Enrollment.findOne({
      student: studentId,
      course: courseId
    });
    
    if (!enrollment) {
      return ResponseFormatter.forbidden(res, {
        message: 'Not enrolled in this course',
        code: 'COURSE_NOT_ENROLLED'
      });
    }
    
    // Check if already completed
    let progress = await Progress.findOne({
      student: studentId,
      course: courseId,
      lesson: lessonId
    });
    
    if (progress && progress.isCompleted) {
      return ResponseFormatter.badRequest(res, {
        message: 'Lesson already completed',
        code: 'LESSON_ALREADY_COMPLETED'
      });
    }
    
    // Mark as completed
    if (!progress) {
      progress = await Progress.create({
        student: studentId,
        course: courseId,
        lesson: lessonId,
        isCompleted: true,
        completedAt: new Date()
      });
    } else {
      progress.isCompleted = true;
      progress.completedAt = new Date();
      await progress.save();
    }
    
    // Calculate course progress
    const totalLessons = await Lesson.countDocuments({
      course: courseId,
      isPublished: true
    });
    
    const completedLessons = await Progress.countDocuments({
      student: studentId,
      course: courseId,
      isCompleted: true
    });
    
    const progressPercentage = Math.round((completedLessons / totalLessons) * 100);
    const isCompleted = completedLessons === totalLessons;
    
    // Update enrollment
    enrollment.progressPercentage = progressPercentage;
    enrollment.completedLessonsCount = completedLessons;
    enrollment.isCompleted = isCompleted;
    enrollment.lastActivityAt = new Date();
    await enrollment.save();
    
    logger.info(`Lesson completed: ${lessonId} by student ${studentId}, course progress: ${progressPercentage}%`);
    
    return ResponseFormatter.success(res, {
      message: 'Lesson completed successfully',
      data: {
        lesson: {
          id: lesson._id,
          title: lesson.title,
          isCompleted: true
        },
        courseProgress: {
          completedLessons,
          totalLessons,
          progressPercentage,
          isCompleted
        }
      }
    });
  }
}

module.exports = new StudentController();