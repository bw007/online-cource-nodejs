const express = require('express');
const { authenticate, requireAdmin, requireAuth, asyncHandler } = require('@/middlewares');

const { 
  uploadVideo, 
  uploadThumbnail, 
  uploadAvatar, 
  uploadCourseContent,
  cleanupOnError,
  validateUploadedFile
} = require('@/middlewares/upload');

const { uploadController } = require('@/controllers');
const { uploadSuccess } = require('@/constants/success');

const router = express.Router();

// Apply cleanup middleware to all upload routes
router.use(cleanupOnError);

// ADMIN VIDEO UPLOAD
router.post('/video', 
  authenticate, 
  requireAdmin,
  uploadVideo,
  validateUploadedFile,
  asyncHandler(uploadController.uploadVideo)
);

// ADMIN IMAGE/THUMBNAIL UPLOAD
router.post('/image', 
  authenticate, 
  requireAdmin,
  uploadThumbnail,
  validateUploadedFile,
  asyncHandler(uploadController.uploadImage)
);

// USER AVATAR UPLOAD
router.post('/avatar', 
  authenticate, 
  requireAuth,
  uploadAvatar,
  validateUploadedFile,
  asyncHandler(uploadController.uploadAvatar)
);

// ADMIN COURSE CONTENT UPLOAD (video + thumbnail)
router.post('/course-content', 
  authenticate, 
  requireAdmin,
  uploadCourseContent,
  validateUploadedFile,
  asyncHandler(uploadController.uploadCourseContent)
);

// ADMIN FILE MANAGEMENT
router.delete('/files/:filename', 
  authenticate, 
  requireAdmin,
  asyncHandler(uploadController.deleteFile)
);

router.get('/files/:filename/info', 
  authenticate, 
  requireAuth,
  asyncHandler(uploadController.getFileInfo)
);

module.exports = router;