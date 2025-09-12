const { uploadErrors } = require('@/constants/errors');
const { ResponseFormatter, logger } = require('@/utils');
const { User, Lesson } = require('@/models');
const { cleanupFile } = require('@/middlewares/upload');

/**
 * Upload Controller
 * Handles file upload operations for videos, images, and documents
 */
class UploadController {

  /**
   * Upload video for lesson
   * Admin uploads video file for lesson content
   * 
   * @async
   * @param {Object} req - Express request object
   * @param {Object} req.file - Uploaded video file
   * @param {Object} req.user - Authenticated admin user
   * @param {Object} res - Express response object
   * @returns {Object} JSON response with video file info
   */
  async uploadVideo(req, res) {
    if (!req.file) {
      return ResponseFormatter.badRequest(res, uploadErrors.NO_FILE_PROVIDED);
    }

    const { filename, path, size, mimetype } = req.file;
    
    // Generate video URL
    const videoUrl = `/uploads/videos/${filename}`;
    
    logger.info(`Video uploaded: ${filename} by admin ${req.user.id}`);
    
    return ResponseFormatter.created(res, {
      ...uploadSuccess.VIDEO_UPLOADED,
      data: {
        video: {
          filename,
          url: videoUrl,
          path,
          size,
          mimetype,
          uploadedAt: new Date().toISOString()
        }
      }
    });
  }

  /**
   * Upload thumbnail/image
   * Admin uploads thumbnail for course or general images
   * 
   * @async
   * @param {Object} req - Express request object
   * @param {Object} req.file - Uploaded image file
   * @param {Object} req.user - Authenticated admin user
   * @param {Object} res - Express response object
   * @returns {Object} JSON response with image file info
   */
  async uploadImage(req, res) {
    if (!req.file) {
      return ResponseFormatter.badRequest(res, uploadErrors.NO_FILE_PROVIDED);
    }

    const { filename, path, size, mimetype } = req.file;
    
    // Generate image URL
    const imageUrl = `/uploads/thumbnails/${filename}`;
    
    logger.info(`Image uploaded: ${filename} by admin ${req.user.id}`);
    
    return ResponseFormatter.created(res, {
      ...uploadSuccess.IMAGE_UPLOADED,
      data: {
        image: {
          filename,
          url: imageUrl,
          path,
          size,
          mimetype,
          uploadedAt: new Date().toISOString()
        }
      }
    });
  }

  /**
   * Upload user avatar
   * User uploads profile picture
   * 
   * @async
   * @param {Object} req - Express request object
   * @param {Object} req.file - Uploaded avatar file
   * @param {Object} req.user - Authenticated user
   * @param {Object} res - Express response object
   * @returns {Object} JSON response with avatar info
   */
  async uploadAvatar(req, res) {
    if (!req.file) {
      return ResponseFormatter.badRequest(res, uploadErrors.NO_FILE_PROVIDED);
    }

    const { filename, path, size, mimetype } = req.file;
    const userId = req.user.id;
    
    // Generate avatar URL
    const avatarUrl = `/uploads/avatars/${filename}`;
    
    // Update user's avatar in database
    const user = await User.findByIdAndUpdate(
      userId,
      { avatar: avatarUrl },
      { new: true }
    ).select('-password -refreshToken');

    if (!user) {
      // Cleanup uploaded file if user not found
      await cleanupFile(path);
      return ResponseFormatter.notFound(res, {
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }
    
    logger.info(`Avatar uploaded: ${filename} for user ${userId}`);
    
    return ResponseFormatter.created(res, {
      message: 'Avatar updated successfully',
      data: {
        avatar: {
          filename,
          url: avatarUrl,
          size,
          mimetype,
          uploadedAt: new Date().toISOString()
        },
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar
        }
      }
    });
  }

  /**
   * Upload course content (video + thumbnail)
   * Admin uploads both video and thumbnail at once
   * 
   * @async
   * @param {Object} req - Express request object
   * @param {Object} req.files - Uploaded files object
   * @param {Object} req.user - Authenticated admin user
   * @param {Object} res - Express response object
   * @returns {Object} JSON response with uploaded files info
   */
  async uploadCourseContent(req, res) {
    if (!req.files || Object.keys(req.files).length === 0) {
      return ResponseFormatter.badRequest(res, uploadErrors.NO_FILE_PROVIDED);
    }

    const uploadedFiles = {};

    // Process video file
    if (req.files.video && req.files.video[0]) {
      const videoFile = req.files.video[0];
      uploadedFiles.video = {
        filename: videoFile.filename,
        url: `/uploads/videos/${videoFile.filename}`,
        size: videoFile.size,
        mimetype: videoFile.mimetype
      };
    }

    // Process thumbnail file
    if (req.files.thumbnail && req.files.thumbnail[0]) {
      const thumbnailFile = req.files.thumbnail[0];
      uploadedFiles.thumbnail = {
        filename: thumbnailFile.filename,
        url: `/uploads/thumbnails/${thumbnailFile.filename}`,
        size: thumbnailFile.size,
        mimetype: thumbnailFile.mimetype
      };
    }

    logger.info(`Course content uploaded by admin ${req.user.id}:`, Object.keys(uploadedFiles));
    
    return ResponseFormatter.created(res, {
      message: 'Course content uploaded successfully',
      data: {
        files: uploadedFiles,
        uploadedAt: new Date().toISOString()
      }
    });
  }

  /**
   * Delete uploaded file
   * Admin can delete unused uploaded files
   * 
   * @async
   * @param {Object} req - Express request object
   * @param {string} req.params.filename - File name to delete
   * @param {string} req.query.type - File type (video, image, avatar)
   * @param {Object} req.user - Authenticated admin user
   * @param {Object} res - Express response object
   * @returns {Object} JSON response
   */
  async deleteFile(req, res) {
    const { filename } = req.params;
    const { type = 'image' } = req.query;

    if (!filename) {
      return ResponseFormatter.badRequest(res, {
        message: 'Filename is required',
        code: 'MISSING_FILENAME'
      });
    }

    // Determine file path based on type
    let filePath;
    switch (type) {
      case 'video':
        filePath = `./uploads/videos/${filename}`;
        break;
      case 'avatar':
        filePath = `./uploads/avatars/${filename}`;
        break;
      case 'document':
        filePath = `./uploads/documents/${filename}`;
        break;
      default:
        filePath = `./uploads/thumbnails/${filename}`;
    }

    try {
      await cleanupFile(filePath);
      
      logger.info(`File deleted: ${filename} (${type}) by admin ${req.user.id}`);
      
      return ResponseFormatter.success(res, {
        message: 'File deleted successfully',
        data: {
          filename,
          type,
          deletedAt: new Date().toISOString()
        }
      });
    } catch (error) {
      logger.error(`Failed to delete file ${filename}:`, error);
      
      return ResponseFormatter.internalError(res, uploadErrors.FILE_DELETE_FAILED);
    }
  }

  /**
   * Get uploaded file info
   * Retrieve information about uploaded file
   * 
   * @async
   * @param {Object} req - Express request object
   * @param {string} req.params.filename - File name
   * @param {string} req.query.type - File type
   * @param {Object} res - Express response object
   * @returns {Object} JSON response with file info
   */
  async getFileInfo(req, res) {
    const { filename } = req.params;
    const { type = 'image' } = req.query;

    if (!filename) {
      return ResponseFormatter.badRequest(res, {
        message: 'Filename is required',
        code: 'MISSING_FILENAME'
      });
    }

    // Generate URL based on type
    let fileUrl;
    switch (type) {
      case 'video':
        fileUrl = `/uploads/videos/${filename}`;
        break;
      case 'avatar':
        fileUrl = `/uploads/avatars/${filename}`;
        break;
      case 'document':
        fileUrl = `/uploads/documents/${filename}`;
        break;
      default:
        fileUrl = `/uploads/thumbnails/${filename}`;
    }

    return ResponseFormatter.success(res, {
      message: 'File info retrieved successfully',
      data: {
        filename,
        url: fileUrl,
        type
      }
    });
  }
}

module.exports = new UploadController();