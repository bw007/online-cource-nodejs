// swagger/paths/public.paths.js
/**
 * @swagger
 * /api/v1/public/courses:
 *   get:
 *     summary: Get published courses
 *     description: Browse all published courses with optional filtering and search
 *     tags: [Public]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 12
 *         description: Number of courses per page
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [Development, Web Development, Data Science, Mobile Development, Game Development, Cloud Computing, Cyber Security, AI & Machine Learning, DevOps, UI/UX Design, Software Testing]
 *         description: Filter by course category
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in course title and description
 *         example: "javascript"
 *     responses:
 *       200:
 *         description: Published courses retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CoursesResponse'
 *             example:
 *               success: true
 *               message: "Courses retrieved successfully"
 *               data:
 *                 courses:
 *                   - id: "60f1b2b3e1b3f4001f123456"
 *                     title: "Complete JavaScript Course"
 *                     description: "Learn JavaScript from basics to advanced"
 *                     price: 75000
 *                     thumbnail: "https://example.com/js-course.jpg"
 *                     category: "Web Development"
 *                     studentsCount: 1200
 *                     lessonsCount: 45
 *                     instructor:
 *                       name: "John Doe"
 *                       email: "john@example.com"
 *                 pagination:
 *                   current: 1
 *                   total: 5
 *                   count: 12
 *                   totalRecords: 48
 * 
 * /api/v1/public/courses/{id}:
 *   get:
 *     summary: Get course details (public view)
 *     description: Get detailed information about a published course including published lessons
 *     tags: [Public]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID
 *         example: "60f1b2b3e1b3f4001f123456"
 *     responses:
 *       200:
 *         description: Course details retrieved successfully
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
 *                   example: "Course details retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     course:
 *                       $ref: '#/components/schemas/Course'
 *                     lessons:
 *                       type: array
 *                       items:
 *                         allOf:
 *                           - $ref: '#/components/schemas/Lesson'
 *                           - type: object
 *                             properties:
 *                               hasAccess:
 *                                 type: boolean
 *                                 description: "Whether user can access this lesson (preview only for non-enrolled)"
 *             example:
 *               success: true
 *               message: "Course details retrieved successfully"
 *               data:
 *                 course:
 *                   id: "60f1b2b3e1b3f4001f123456"
 *                   title: "Complete JavaScript Course"
 *                   description: "Learn JavaScript from basics to advanced"
 *                   price: 75000
 *                   category: "Web Development"
 *                   studentsCount: 1200
 *                   lessonsCount: 45
 *                 lessons:
 *                   - id: "60f1b2b3e1b3f4001f789012"
 *                     title: "Introduction to JavaScript"
 *                     duration: 1800
 *                     order: 1
 *                     isPreview: true
 *                     hasAccess: true
 *                   - id: "60f1b2b3e1b3f4001f789013"
 *                     title: "Variables and Data Types"
 *                     duration: 2400
 *                     order: 2
 *                     isPreview: false
 *                     hasAccess: false
 *       404:
 *         description: Course not found or not published
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 * 
 * /api/v1/public/lessons/{id}:
 *   get:
 *     summary: Get lesson (preview only)
 *     description: Access lesson content - only works for preview lessons for non-enrolled users
 *     tags: [Public]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Lesson ID
 *         example: "60f1b2b3e1b3f4001f789012"
 *     responses:
 *       200:
 *         description: Lesson retrieved successfully
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
 *                   example: "Lesson details retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     lesson:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         title:
 *                           type: string
 *                         description:
 *                           type: string
 *                         duration:
 *                           type: number
 *                         formattedDuration:
 *                           type: string
 *                         order:
 *                           type: number
 *                         isPreview:
 *                           type: boolean
 *                         hasAccess:
 *                           type: boolean
 *                         video:
 *                           type: object
 *                           properties:
 *                             defaultQuality:
 *                               type: string
 *                             availableQualities:
 *                               type: array
 *                               items:
 *                                 type: string
 *                             videoUrl:
 *                               type: string
 *                               description: "Only available if hasAccess is true"
 *                         course:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: string
 *                             title:
 *                               type: string
 *             example:
 *               success: true
 *               message: "Lesson details retrieved successfully"
 *               data:
 *                 lesson:
 *                   id: "60f1b2b3e1b3f4001f789012"
 *                   title: "Introduction to JavaScript"
 *                   description: "Learn the basics of JavaScript programming"
 *                   duration: 1800
 *                   formattedDuration: "30:00"
 *                   order: 1
 *                   isPreview: true
 *                   hasAccess: true
 *                   video:
 *                     defaultQuality: "720p"
 *                     availableQualities: ["360p", "720p", "1080p"]
 *                     videoUrl: "https://videos.com/intro-js-720p.mp4"
 *                   course:
 *                     id: "60f1b2b3e1b3f4001f123456"
 *                     title: "Complete JavaScript Course"
 *       403:
 *         description: Access denied - lesson is not a preview
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Lesson not found or not published
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */