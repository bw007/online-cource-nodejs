/**
 * @swagger
 * /api/v1/upload/video:
 *   post:
 *     summary: Upload video file
 *     description: Upload video file for lesson content (Admin only)
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               video:
 *                 type: string
 *                 format: binary
 *                 description: Video file (MP4, AVI, MOV, WEBM - max 500MB)
 *     responses:
 *       201:
 *         description: Video uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Video uploaded successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     video:
 *                       type: object
 *                       properties:
 *                         filename:
 *                           type: string
 *                           example: "lesson-video-uuid-timestamp.mp4"
 *                         url:
 *                           type: string
 *                           example: "/uploads/videos/lesson-video-uuid-timestamp.mp4"
 *                         size:
 *                           type: number
 *                           example: 52428800
 *                         mimetype:
 *                           type: string
 *                           example: "video/mp4"
 *                         uploadedAt:
 *                           type: string
 *                           format: date-time
 *       400:
 *         description: Bad request - no file provided or invalid file type
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       413:
 *         description: Payload too large - file size exceeds limit
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 * 
 * /api/v1/upload/image:
 *   post:
 *     summary: Upload image file
 *     description: Upload image/thumbnail for course content (Admin only)
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               thumbnail:
 *                 type: string
 *                 format: binary
 *                 description: Image file (JPG, PNG, GIF, WEBP - max 5MB)
 *     responses:
 *       201:
 *         description: Image uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Image uploaded successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     image:
 *                       type: object
 *                       properties:
 *                         filename:
 *                           type: string
 *                           example: "course-thumbnail-uuid-timestamp.jpg"
 *                         url:
 *                           type: string
 *                           example: "/uploads/thumbnails/course-thumbnail-uuid-timestamp.jpg"
 *                         size:
 *                           type: number
 *                           example: 1048576
 *                         mimetype:
 *                           type: string
 *                           example: "image/jpeg"
 *                         uploadedAt:
 *                           type: string
 *                           format: date-time
 *       400:
 *         description: Bad request - no file provided or invalid file type
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 * 
 * /api/v1/upload/avatar:
 *   post:
 *     summary: Upload user avatar
 *     description: Upload profile picture for current user
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *                 description: Avatar image file (JPG, PNG - max 2MB)
 *     responses:
 *       201:
 *         description: Avatar uploaded and updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Avatar updated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     avatar:
 *                       type: object
 *                       properties:
 *                         filename:
 *                           type: string
 *                           example: "user-avatar-uuid-timestamp.jpg"
 *                         url:
 *                           type: string
 *                           example: "/uploads/avatars/user-avatar-uuid-timestamp.jpg"
 *                         size:
 *                           type: number
 *                           example: 524288
 *                         mimetype:
 *                           type: string
 *                           example: "image/jpeg"
 *                         uploadedAt:
 *                           type: string
 *                           format: date-time
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         email:
 *                           type: string
 *                         avatar:
 *                           type: string
 *       400:
 *         description: Bad request - no file provided or invalid file type
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 * 
 * /api/v1/upload/course-content:
 *   post:
 *     summary: Upload course content
 *     description: Upload video and thumbnail together for course/lesson (Admin only)
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               video:
 *                 type: string
 *                 format: binary
 *                 description: Video file (optional)
 *               thumbnail:
 *                 type: string
 *                 format: binary
 *                 description: Thumbnail image file (optional)
 *     responses:
 *       201:
 *         description: Course content uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Course content uploaded successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     files:
 *                       type: object
 *                       properties:
 *                         video:
 *                           type: object
 *                           properties:
 *                             filename:
 *                               type: string
 *                             url:
 *                               type: string
 *                             size:
 *                               type: number
 *                             mimetype:
 *                               type: string
 *                         thumbnail:
 *                           type: object
 *                           properties:
 *                             filename:
 *                               type: string
 *                             url:
 *                               type: string
 *                             size:
 *                               type: number
 *                             mimetype:
 *                               type: string
 *                     uploadedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Bad request - no files provided
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 * 
 * /api/v1/upload/files/{filename}:
 *   delete:
 *     summary: Delete uploaded file
 *     description: Delete uploaded file from server (Admin only)
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: filename
 *         required: true
 *         schema:
 *           type: string
 *         description: File name to delete
 *         example: "lesson-video-uuid-timestamp.mp4"
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [video, image, avatar, document]
 *           default: image
 *         description: File type to determine correct directory
 *         example: "video"
 *     responses:
 *       200:
 *         description: File deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "File deleted successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     filename:
 *                       type: string
 *                       example: "lesson-video-uuid-timestamp.mp4"
 *                     type:
 *                       type: string
 *                       example: "video"
 *                     deletedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Bad request - filename required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: File not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error - file deletion failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 * 
 * /api/v1/upload/files/{filename}/info:
 *   get:
 *     summary: Get file information
 *     description: Retrieve information about uploaded file
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: filename
 *         required: true
 *         schema:
 *           type: string
 *         description: File name
 *         example: "lesson-video-uuid-timestamp.mp4"
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [video, image, avatar, document]
 *           default: image
 *         description: File type to determine correct directory
 *         example: "video"
 *     responses:
 *       200:
 *         description: File info retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "File info retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     filename:
 *                       type: string
 *                       example: "lesson-video-uuid-timestamp.mp4"
 *                     url:
 *                       type: string
 *                       example: "/uploads/videos/lesson-video-uuid-timestamp.mp4"
 *                     type:
 *                       type: string
 *                       example: "video"
 *       400:
 *         description: Bad request - filename required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */