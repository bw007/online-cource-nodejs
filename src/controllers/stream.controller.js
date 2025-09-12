const fs = require('fs');
const path = require('path');
const { Lesson, Enrollment } = require('@/models');
const { ResponseFormatter, logger } = require('@/utils');

/**
 * Video Streaming Controller
 * Handles secure video streaming with access control
 */
class StreamController {

  /**
   * Stream video with access control
   * Only enrolled students or preview lessons can be accessed
   * 
   * @async
   * @param {Object} req - Express request object
   * @param {string} req.params.lessonId - Lesson ID
   * @param {string} req.params.quality - Video quality (360p, 720p, 1080p)
   * @param {Object} req.user - Authenticated user (optional)
   * @param {Object} res - Express response object
   * @returns {Stream} Video stream or error response
   */
  async streamVideo(req, res) {
    const { lessonId, quality = '720p' } = req.params;
    const userId = req.user?.id;

    try {
      // Get lesson with course info
      const lesson = await Lesson.findOne({
        _id: lessonId,
        isPublished: true
      }).populate('course', 'isPublished');

      if (!lesson || !lesson.course.isPublished) {
        return ResponseFormatter.notFound(res, {
          message: 'Video not found',
          code: 'VIDEO_NOT_FOUND'
        });
      }

      // Check access permissions
      let hasAccess = lesson.isPreview; // Free preview access

      if (!hasAccess && userId) {
        // Check if user is enrolled
        const enrollment = await Enrollment.findOne({
          student: userId,
          course: lesson.course._id
        });
        hasAccess = !!enrollment;
      }

      if (!hasAccess) {
        return ResponseFormatter.forbidden(res, {
          message: 'Access denied to this video',
          code: 'VIDEO_ACCESS_DENIED'
        });
      }

      // Get video URL based on quality
      const videoUrl = lesson.video.qualities[quality] || 
                      lesson.video.qualities[lesson.video.defaultQuality] ||
                      lesson.video.originalUrl;

      if (!videoUrl) {
        return ResponseFormatter.notFound(res, {
          message: 'Video quality not available',
          code: 'VIDEO_QUALITY_NOT_FOUND'
        });
      }

      // If URL is external, redirect
      if (videoUrl.startsWith('http')) {
        return res.redirect(videoUrl);
      }

      // Stream local file
      const videoPath = path.join(process.cwd(), videoUrl);
      
      // Check if file exists
      if (!fs.existsSync(videoPath)) {
        return ResponseFormatter.notFound(res, {
          message: 'Video file not found',
          code: 'VIDEO_FILE_NOT_FOUND'
        });
      }

      const stat = fs.statSync(videoPath);
      const fileSize = stat.size;
      const range = req.headers.range;

      if (range) {
        // Handle range requests for video seeking
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunksize = (end - start) + 1;
        const file = fs.createReadStream(videoPath, { start, end });
        const head = {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunksize,
          'Content-Type': 'video/mp4',
        };
        res.writeHead(206, head);
        file.pipe(res);
      } else {
        // Stream entire file
        const head = {
          'Content-Length': fileSize,
          'Content-Type': 'video/mp4',
        };
        res.writeHead(200, head);
        fs.createReadStream(videoPath).pipe(res);
      }

      logger.info(`Video streamed: ${lessonId} (${quality}) to user ${userId || 'anonymous'}`);

    } catch (error) {
      logger.error('Video streaming error:', error);
      return ResponseFormatter.internalError(res, {
        message: 'Video streaming failed',
        code: 'VIDEO_STREAM_ERROR'
      });
    }
  }

  /**
   * Get video info without streaming
   * Returns video metadata and access status
   * 
   * @async
   * @param {Object} req - Express request object
   * @param {string} req.params.lessonId - Lesson ID
   * @param {Object} req.user - Authenticated user (optional)
   * @param {Object} res - Express response object
   * @returns {Object} JSON response with video info
   */
  async getVideoInfo(req, res) {
    const { lessonId } = req.params;
    const userId = req.user?.id;

    const lesson = await Lesson.findOne({
      _id: lessonId,
      isPublished: true
    }).populate('course', 'title isPublished');

    if (!lesson || !lesson.course.isPublished) {
      return ResponseFormatter.notFound(res, {
        message: 'Video not found',
        code: 'VIDEO_NOT_FOUND'
      });
    }

    // Check access permissions
    let hasAccess = lesson.isPreview;

    if (!hasAccess && userId) {
      const enrollment = await Enrollment.findOne({
        student: userId,
        course: lesson.course._id
      });
      hasAccess = !!enrollment;
    }

    const videoInfo = {
      id: lesson._id,
      title: lesson.title,
      duration: lesson.duration,
      formattedDuration: lesson.formattedDuration,
      hasAccess,
      isPreview: lesson.isPreview,
      course: {
        id: lesson.course._id,
        title: lesson.course.title
      }
    };

    if (hasAccess) {
      videoInfo.availableQualities = Object.keys(lesson.video.qualities)
        .filter(quality => lesson.video.qualities[quality]);
      videoInfo.defaultQuality = lesson.video.defaultQuality;
    }

    return ResponseFormatter.success(res, {
      message: 'Video info retrieved successfully',
      data: { video: videoInfo }
    });
  }
}

module.exports = new StreamController();