/**
 * @swagger
 * /api/v1/student/courses/{courseId}/enroll:
 *   post:
 *     summary: Enroll in course
 *     description: Enroll student in a published course
 *     tags: [Student]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID to enroll in
 *         example: "60f1b2b3e1b3f4001f123456"
 *     responses:
 *       201:
 *         description: Enrollment successful
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
 *                   example: "Successfully enrolled in course"
 *                 data:
 *                   type: object
 *                   properties:
 *                     enrollment:
 *                       allOf:
 *                         - $ref: '#/components/schemas/Enrollment'
 *                         - type: object
 *                           properties:
 *                             student:
 *                               type: object
 *                               properties:
 *                                 name:
 *                                   type: string
 *                                 email:
 *                                   type: string
 *                             course:
 *                               $ref: '#/components/schemas/Course'
 *       401:
 *         description: Unauthorized - authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Course not found or not published
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Already enrolled in this course
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 * 
 *   delete:
 *     summary: Unenroll from course
 *     description: Remove student enrollment from course
 *     tags: [Student]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID to unenroll from
 *         example: "60f1b2b3e1b3f4001f123456"
 *     responses:
 *       200:
 *         description: Unenrollment successful
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
 *                   example: "Successfully unenrolled from course"
 *       401:
 *         description: Unauthorized - authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Not enrolled in this course
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 * 
 * /api/v1/student/my-courses:
 *   get:
 *     summary: Get enrolled courses
 *     description: Get list of courses the student is enrolled in with progress information
 *     tags: [Student]
 *     security:
 *       - bearerAuth: []
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
 *           default: 10
 *         description: Number of courses per page
 *     responses:
 *       200:
 *         description: Enrolled courses retrieved successfully
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
 *                   example: "Courses retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     courses:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           enrollment:
 *                             $ref: '#/components/schemas/Enrollment'
 *                           course:
 *                             $ref: '#/components/schemas/Course'
 *                     pagination:
 *                       $ref: '#/components/schemas/PaginationResponse'
 *             example:
 *               success: true
 *               message: "Courses retrieved successfully"
 *               data:
 *                 courses:
 *                   - enrollment:
 *                       id: "60f1b2b3e1b3f4001f345678"
 *                       enrolledAt: "2024-01-15T10:30:00Z"
 *                       progressPercentage: 65
 *                       isCompleted: false
 *                       lastActivityAt: "2024-01-20T15:45:00Z"
 *                     course:
 *                       id: "60f1b2b3e1b3f4001f123456"
 *                       title: "Complete JavaScript Course"
 *                       thumbnail: "https://example.com/js-course.jpg"
 *                       lessonsCount: 45
 *                 pagination:
 *                   current: 1
 *                   total: 2
 *                   count: 3
 *                   totalRecords: 3
 *       401:
 *         description: Unauthorized - authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 * 
 * /api/v1/student/my-courses/{courseId}:
 *   get:
 *     summary: Get enrolled course details
 *     description: Get detailed information about an enrolled course including lessons and progress
 *     tags: [Student]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID
 *         example: "60f1b2b3e1b3f4001f123456"
 *     responses:
 *       200:
 *         description: Enrolled course details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EnrolledCourseDetailResponse'
 *             example:
 *               success: true
 *               message: "Course details retrieved successfully"
 *               data:
 *                 course:
 *                   id: "60f1b2b3e1b3f4001f123456"
 *                   title: "Complete JavaScript Course"
 *                   description: "Learn JavaScript from basics to advanced"
 *                   lessonsCount: 45
 *                 enrollment:
 *                   progressPercentage: 65
 *                   lastWatchedLesson: "60f1b2b3e1b3f4001f789015"
 *                   isCompleted: false
 *                 lessons:
 *                   - id: "60f1b2b3e1b3f4001f789012"
 *                     title: "Introduction to JavaScript"
 *                     duration: 1800
 *                     order: 1
 *                     progress:
 *                       watchTime: 1800
 *                       watchPercentage: 100
 *                       isCompleted: true
 *                   - id: "60f1b2b3e1b3f4001f789013"
 *                     title: "Variables and Data Types"
 *                     duration: 2400
 *                     order: 2
 *                     progress:
 *                       watchTime: 1200
 *                       watchPercentage: 50
 *                       isCompleted: false
 *       401:
 *         description: Unauthorized - authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Not enrolled in this course
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 * 
 * /api/v1/student/lessons/{lessonId}:
 *   get:
 *     summary: Get lesson for enrolled student
 *     description: Access lesson content with video URLs for enrolled students
 *     tags: [Student]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: lessonId
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
 *                   example: "Lesson retrieved successfully"
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
 *                         course:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: string
 *                             title:
 *                               type: string
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
 *                               description: "Full video URL for enrolled students"
 *                         progress:
 *                           $ref: '#/components/schemas/Progress'
 *             example:
 *               success: true
 *               message: "Lesson retrieved successfully"
 *               data:
 *                 lesson:
 *                   id: "60f1b2b3e1b3f4001f789012"
 *                   title: "Introduction to JavaScript"
 *                   description: "Learn the basics of JavaScript programming"
 *                   duration: 1800
 *                   formattedDuration: "30:00"
 *                   order: 1
 *                   course:
 *                     id: "60f1b2b3e1b3f4001f123456"
 *                     title: "Complete JavaScript Course"
 *                   video:
 *                     defaultQuality: "720p"
 *                     availableQualities: ["360p", "720p", "1080p"]
 *                     videoUrl: "https://videos.com/intro-js-720p.mp4"
 *                   progress:
 *                     watchTime: 900
 *                     watchPercentage: 50
 *                     isCompleted: false
 *       401:
 *         description: Unauthorized - authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Access denied - not enrolled in course or lesson not accessible
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Lesson not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 * 
 * /api/v1/student/lessons/{lessonId}/progress:
 *   post:
 *     summary: Update lesson progress
 *     description: Record video watch progress and completion status
 *     tags: [Student]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: string
 *         description: Lesson ID
 *         example: "60f1b2b3e1b3f4001f789012"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateProgressRequest'
 *           example:
 *             watchTime: 900
 *             duration: 1800
 *     responses:
 *       200:
 *         description: Progress updated successfully
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
 *                   example: "Progress updated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     progress:
 *                       allOf:
 *                         - $ref: '#/components/schemas/Progress'
 *                         - type: object
 *                           properties:
 *                             student:
 *                               type: string
 *                             lesson:
 *                               type: string
 *                             course:
 *                               type: string
 *                             completedAt:
 *                               type: string
 *                               format: date-time
 *                               nullable: true
 *             example:
 *               success: true
 *               message: "Progress updated successfully"
 *               data:
 *                 progress:
 *                   student: "60f1b2b3e1b3f4001f567890"
 *                   lesson: "60f1b2b3e1b3f4001f789012"
 *                   course: "60f1b2b3e1b3f4001f123456"
 *                   watchTime: 900
 *                   watchPercentage: 50
 *                   isCompleted: false
 *                   completedAt: null
 *       400:
 *         description: Bad request - missing required data
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
 *         description: Not enrolled in course
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Lesson not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */