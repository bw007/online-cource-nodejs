/**
 * @swagger
 * /api/v1/stream/video/{lessonId}:
 *   get:
 *     summary: Stream video content
 *     description: Stream lesson video with access control (enrolled students or preview lessons)
 *     tags: [Video Streaming]
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: string
 *         description: Lesson ID
 *         example: "60f1b2b3e1b3f4001f789012"
 *       - in: query
 *         name: info
 *         schema:
 *           type: string
 *           enum: [true, false]
 *         description: Return video info instead of streaming (info=true)
 *         example: "true"
 *       - in: header
 *         name: Authorization
 *         schema:
 *           type: string
 *         description: Optional Bearer token for enrolled student access
 *         example: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       - in: header
 *         name: Range
 *         schema:
 *           type: string
 *         description: Optional range header for video seeking
 *         example: "bytes=0-1023"
 *     responses:
 *       200:
 *         description: Video streaming response or video info (depending on query parameter)
 *         content:
 *           video/mp4:
 *             schema:
 *               type: string
 *               format: binary
 *               description: Video stream (when info=false or not provided)
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Video info retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     video:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "60f1b2b3e1b3f4001f789012"
 *                         title:
 *                           type: string
 *                           example: "Introduction to JavaScript"
 *                         duration:
 *                           type: number
 *                           example: 1800
 *                         formattedDuration:
 *                           type: string
 *                           example: "30:00"
 *                         hasAccess:
 *                           type: boolean
 *                           example: true
 *                         isPreview:
 *                           type: boolean
 *                           example: true
 *                         availableQualities:
 *                           type: array
 *                           items:
 *                             type: string
 *                           example: ["360p", "720p", "1080p"]
 *                         defaultQuality:
 *                           type: string
 *                           example: "720p"
 *                         course:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: string
 *                             title:
 *                               type: string
 *               description: Video information response (when info=true)
 *       206:
 *         description: Partial content response for range requests
 *         headers:
 *           Content-Range:
 *             schema:
 *               type: string
 *             description: Range of bytes being returned
 *             example: "bytes 0-1023/2048000"
 *           Accept-Ranges:
 *             schema:
 *               type: string
 *             description: Indicates server accepts range requests
 *             example: "bytes"
 *           Content-Length:
 *             schema:
 *               type: integer
 *             description: Length of partial content
 *             example: 1024
 *         content:
 *           video/mp4:
 *             schema:
 *               type: string
 *               format: binary
 *               description: Partial video stream
 *       302:
 *         description: Redirect to external video URL
 *         headers:
 *           Location:
 *             schema:
 *               type: string
 *             description: External video URL
 *             example: "https://cdn.example.com/videos/lesson.mp4"
 *       403:
 *         description: Access denied - not enrolled or lesson not preview
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Access denied to this video"
 *               code: "VIDEO_ACCESS_DENIED"
 *       404:
 *         description: Video not found or not published
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Video not found"
 *               code: "VIDEO_NOT_FOUND"
 *       500:
 *         description: Internal server error - video streaming failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Video streaming failed"
 *               code: "VIDEO_STREAM_ERROR"
 * 
 * /api/v1/stream/video/{lessonId}/info:
 *   get:
 *     summary: Get video information
 *     description: Get video metadata and access status (alternative endpoint for video info)
 *     tags: [Video Streaming]
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: string
 *         description: Lesson ID
 *         example: "60f1b2b3e1b3f4001f789012"
 *       - in: header
 *         name: Authorization
 *         schema:
 *           type: string
 *         description: Optional Bearer token for enrolled student access
 *         example: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *     responses:
 *       200:
 *         description: Video information retrieved successfully
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
 *                   example: "Video info retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     video:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "60f1b2b3e1b3f4001f789012"
 *                         title:
 *                           type: string
 *                           example: "Introduction to JavaScript"
 *                         duration:
 *                           type: number
 *                           example: 1800
 *                         formattedDuration:
 *                           type: string
 *                           example: "30:00"
 *                         hasAccess:
 *                           type: boolean
 *                           example: true
 *                           description: "Whether user can access this video"
 *                         isPreview:
 *                           type: boolean
 *                           example: true
 *                           description: "Whether this is a preview lesson"
 *                         availableQualities:
 *                           type: array
 *                           items:
 *                             type: string
 *                           example: ["360p", "720p", "1080p"]
 *                           description: "Available if user has access"
 *                         defaultQuality:
 *                           type: string
 *                           example: "720p"
 *                           description: "Available if user has access"
 *                         course:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: string
 *                               example: "60f1b2b3e1b3f4001f123456"
 *                             title:
 *                               type: string
 *                               example: "Complete JavaScript Course"
 *       403:
 *         description: Access denied - video not accessible
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Video not found or not published
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */