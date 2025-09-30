const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');
const { uploadErrors } = require('@/constants/errors');
const { logger } = require('@/utils');

/**
 * Async directory creation with error handling
 */
const ensureUploadDirs = async () => {
  const dirs = [
    './uploads/videos',
    './uploads/thumbnails', 
    './uploads/avatars',
    './uploads/documents'
  ];
  
  for (const dir of dirs) {
    try {
      await fs.mkdir(dir, { recursive: true });
      logger.info(`Upload directory ensured: ${dir}`);
    } catch (error) {
      logger.error(`Failed to create upload directory ${dir}:`, error);
      throw error;
    }
  }
};

// Initialize upload directories
ensureUploadDirs().catch(error => {
  logger.error('Failed to initialize upload directories:', error);
  process.exit(1);
});

/**
 * Storage configuration with dynamic path handling
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = './uploads/';
    
    switch (file.fieldname) {
      case 'video':
        uploadPath += 'videos/';
        break;
      case 'thumbnail':
        uploadPath += 'thumbnails/';
        break;
      case 'avatar':
        uploadPath += 'avatars/';
        break;
      case 'document':
        uploadPath += 'documents/';
        break;
      default:
        uploadPath += 'misc/';
    }
    
    cb(null, uploadPath);
  },
  
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp and UUID
    const fileExtension = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, fileExtension);
    const uniqueName = `${baseName}-${uuidv4()}-${Date.now()}${fileExtension}`;
    cb(null, uniqueName);
  }
});

/**
 * File type validation configurations
 */
const fileValidators = {
  video: {
    mimeTypes: ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo', 'video/webm'],
    extensions: ['.mp4', '.mpeg', '.mov', '.avi', '.webm'],
    maxSize: 500 * 1024 * 1024 // 500MB
  },
  image: {
    mimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    extensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
    maxSize: 5 * 1024 * 1024 // 5MB
  },
  avatar: {
    mimeTypes: ['image/jpeg', 'image/png'],
    extensions: ['.jpg', '.jpeg', '.png'],
    maxSize: 2 * 1024 * 1024 // 2MB
  },
  document: {
    mimeTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    extensions: ['.pdf', '.doc', '.docx'],
    maxSize: 10 * 1024 * 1024 // 10MB
  }
};

/**
 * Generic file filter factory
 */
const createFileFilter = (validatorKey) => {
  return (req, file, cb) => {
    const validator = fileValidators[validatorKey];
    
    if (!validator) {
      const error = new Error(uploadErrors.INVALID_FILE_TYPE.message);
      error.code = uploadErrors.INVALID_FILE_TYPE.code;
      return cb(error, false);
    }

    const fileExtension = path.extname(file.originalname).toLowerCase();
    
    // Check MIME type
    if (!validator.mimeTypes.includes(file.mimetype)) {
      const error = new Error(`Invalid file type. Allowed types: ${validator.mimeTypes.join(', ')}`);
      error.code = uploadErrors.INVALID_FILE_TYPE.code;
      return cb(error, false);
    }
    
    // Check file extension
    if (!validator.extensions.includes(fileExtension)) {
      const error = new Error(`Invalid file extension. Allowed extensions: ${validator.extensions.join(', ')}`);
      error.code = uploadErrors.INVALID_FILE_TYPE.code;
      return cb(error, false);
    }
    
    cb(null, true);
  };
};

/**
 * Video upload configuration
 */
const videoUploadConfig = {
  storage,
  fileFilter: createFileFilter('video'),
  limits: {
    fileSize: fileValidators.video.maxSize,
    files: 1
  }
};

/**
 * Thumbnail upload configuration
 */
const thumbnailUploadConfig = {
  storage,
  fileFilter: createFileFilter('image'),
  limits: {
    fileSize: fileValidators.image.maxSize,
    files: 1
  }
};

/**
 * Avatar upload configuration
 */
const avatarUploadConfig = {
  storage,
  fileFilter: createFileFilter('avatar'),
  limits: {
    fileSize: fileValidators.avatar.maxSize,
    files: 1
  }
};

/**
 * Document upload configuration
 */
const documentUploadConfig = {
  storage,
  fileFilter: createFileFilter('document'),
  limits: {
    fileSize: fileValidators.document.maxSize,
    files: 1
  }
};

/**
 * Create multer instances
 */
const videoUpload = multer(videoUploadConfig);
const thumbnailUpload = multer(thumbnailUploadConfig);
const avatarUpload = multer(avatarUploadConfig);
const documentUpload = multer(documentUploadConfig);

/**
 * Course content upload (video + thumbnail)
 */
const courseContentUpload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'video') {
      return createFileFilter('video')(req, file, cb);
    } else if (file.fieldname === 'thumbnail') {
      return createFileFilter('image')(req, file, cb);
    } else {
      const error = new Error(uploadErrors.UNEXPECTED_FILE.message);
      error.code = uploadErrors.UNEXPECTED_FILE.code;
      return cb(error, false);
    }
  },
  limits: {
    fileSize: fileValidators.video.maxSize, // Use largest limit
    files: 2
  }
});

/**
 * Upload middleware exports
 */
const uploadVideo = videoUpload.single('video');
const uploadThumbnail = thumbnailUpload.single('thumbnail');
const uploadAvatar = avatarUpload.single('avatar');
const uploadDocument = documentUpload.single('document');

const uploadCourseContent = courseContentUpload.fields([
  { name: 'video', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 }
]);

/**
 * Multiple files upload (for bulk operations)
 */
const uploadMultipleImages = thumbnailUpload.array('images', 5);
const uploadMultipleDocuments = documentUpload.array('documents', 3);

/**
 * File cleanup utility
 */
const cleanupFile = async (filePath) => {
  try {
    if (filePath) {
      await fs.unlink(filePath);
      logger.info(`Cleaned up file: ${filePath}`);
    }
  } catch (error) {
    logger.warn(`Failed to cleanup file ${filePath}:`, error.message);
  }
};

/**
 * Cleanup middleware for failed uploads
 */
const cleanupOnError = (req, res, next) => {
  const originalSend = res.send;
  
  res.send = function(data) {
    // If error response and files were uploaded, clean them up
    if (res.statusCode >= 400 && req.files) {
      const files = Array.isArray(req.files) ? req.files : Object.values(req.files).flat();
      files.forEach(file => {
        if (file.path) {
          cleanupFile(file.path).catch(() => {}); // Silent cleanup
        }
      });
    } else if (res.statusCode >= 400 && req.file) {
      if (req.file.path) {
        cleanupFile(req.file.path).catch(() => {}); // Silent cleanup
      }
    }
    
    return originalSend.call(this, data);
  };
  
  next();
};

/**
 * File validation middleware (additional validation after upload)
 */
const validateUploadedFile = (req, res, next) => {
  if (req.file) {
    // Add custom validation here if needed
    logger.info(`File uploaded successfully: ${req.file.filename}`);
  } else if (req.files) {
    const fileCount = Array.isArray(req.files) ? req.files.length : Object.keys(req.files).length;
    logger.info(`${fileCount} files uploaded successfully`);
  }
  
  next();
};

module.exports = {
  // Single file uploads
  uploadVideo,
  uploadThumbnail,
  uploadAvatar,
  uploadDocument,
  
  // Multi-field uploads
  uploadCourseContent,
  
  // Multiple files uploads
  uploadMultipleImages,
  uploadMultipleDocuments,
  
  // Utility functions
  cleanupFile,
  cleanupOnError,
  validateUploadedFile,
  
  // Configuration for external use
  fileValidators,
  
  // Directory management
  ensureUploadDirs
};