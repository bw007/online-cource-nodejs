/**
 * @swagger
 * components:
 *   schemas:
 *     Course:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "60f1b2b3e1b3f4001f123456"
 *         title:
 *           type: string
 *           example: "Complete Node.js Course"
 *         description:
 *           type: string
 *           example: "Learn Node.js from scratch to advanced level"
 *         price:
 *           type: number
 *           example: 50000
 *         thumbnail:
 *           type: string
 *           nullable: true
 *           example: "https://example.com/thumbnail.jpg"
 *         category:
 *           type: string
 *           enum: [Development, Web Development, Data Science, Mobile Development, Game Development, Cloud Computing, Cyber Security, AI & Machine Learning, DevOps, UI/UX Design, Software Testing]
 *           example: "Web Development"
 *         isPublished:
 *           type: boolean
 *           example: true
 *         studentsCount:
 *           type: number
 *           example: 150
 *         instructor:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *             name:
 *               type: string
 *             email:
 *               type: string
 *         lessonsCount:
 *           type: number
 *           example: 25
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 * 
 *     CreateCourseRequest:
 *       type: object
 *       required:
 *         - title
 *         - description
 *       properties:
 *         title:
 *           type: string
 *           minLength: 1
 *           maxLength: 100
 *           example: "Complete Node.js Course"
 *         description:
 *           type: string
 *           minLength: 1
 *           maxLength: 1000
 *           example: "Learn Node.js from scratch to advanced level"
 *         price:
 *           type: number
 *           minimum: 0
 *           example: 50000
 *         category:
 *           type: string
 *           enum: [Development, Web Development, Data Science, Mobile Development, Game Development, Cloud Computing, Cyber Security, AI & Machine Learning, DevOps, UI/UX Design, Software Testing]
 *           example: "Web Development"
 *         thumbnail:
 *           type: string
 *           example: "https://example.com/thumbnail.jpg"
 * 
 *     Lesson:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "60f1b2b3e1b3f4001f789012"
 *         title:
 *           type: string
 *           example: "Introduction to Variables"
 *         description:
 *           type: string
 *           example: "Learn about JavaScript variables and data types"
 *         duration:
 *           type: number
 *           example: 1800
 *         formattedDuration:
 *           type: string
 *           example: "30:00"
 *         order:
 *           type: number
 *           example: 1
 *         isPreview:
 *           type: boolean
 *           example: true
 *         isPublished:
 *           type: boolean
 *           example: true
 *         video:
 *           type: object
 *           properties:
 *             defaultQuality:
 *               type: string
 *               enum: [360p, 720p, 1080p]
 *               example: "720p"
 *             originalUrl:
 *               type: string
 *               example: "https://videos.com/lesson1.mp4"
 *             qualities:
 *               type: object
 *               properties:
 *                 360p:
 *                   type: string
 *                   nullable: true
 *                 720p:
 *                   type: string
 *                   nullable: true
 *                 1080p:
 *                   type: string
 *                   nullable: true
 *         course:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *             title:
 *               type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 * 
 *     CreateLessonRequest:
 *       type: object
 *       required:
 *         - title
 *         - originalUrl
 *         - duration
 *       properties:
 *         title:
 *           type: string
 *           minLength: 1
 *           maxLength: 100
 *           example: "Introduction to Variables"
 *         description:
 *           type: string
 *           maxLength: 500
 *           example: "Learn about JavaScript variables"
 *         originalUrl:
 *           type: string
 *           example: "https://videos.com/lesson1.mp4"
 *         duration:
 *           type: number
 *           minimum: 1
 *           example: 1800
 *         order:
 *           type: number
 *           minimum: 1
 *           example: 1
 *           description: "Optional - auto-assigned if not provided"
 *         isPreview:
 *           type: boolean
 *           example: true
 * 
 *     Enrollment:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "60f1b2b3e1b3f4001f345678"
 *         enrolledAt:
 *           type: string
 *           format: date-time
 *         progressPercentage:
 *           type: number
 *           minimum: 0
 *           maximum: 100
 *           example: 65
 *         isCompleted:
 *           type: boolean
 *           example: false
 *         lastActivityAt:
 *           type: string
 *           format: date-time
 *         lastWatchedLesson:
 *           type: string
 *           nullable: true
 *           example: "60f1b2b3e1b3f4001f789012"
 * 
 *     Progress:
 *       type: object
 *       properties:
 *         watchTime:
 *           type: number
 *           example: 900
 *         watchPercentage:
 *           type: number
 *           minimum: 0
 *           maximum: 100
 *           example: 50
 *         isCompleted:
 *           type: boolean
 *           example: false
 * 
 *     UpdateProgressRequest:
 *       type: object
 *       required:
 *         - watchTime
 *         - duration
 *       properties:
 *         watchTime:
 *           type: number
 *           minimum: 0
 *           example: 900
 *           description: "Current watch time in seconds"
 *         duration:
 *           type: number
 *           minimum: 1
 *           example: 1800
 *           description: "Total lesson duration in seconds"
 * 
 *     PaginationResponse:
 *       type: object
 *       properties:
 *         current:
 *           type: number
 *           example: 1
 *         total:
 *           type: number
 *           example: 5
 *         count:
 *           type: number
 *           example: 10
 *         totalRecords:
 *           type: number
 *           example: 45
 * 
 *     CoursesResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Courses retrieved successfully"
 *         timestamp:
 *           type: string
 *           format: date-time
 *         data:
 *           type: object
 *           properties:
 *             courses:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Course'
 *             pagination:
 *               $ref: '#/components/schemas/PaginationResponse'
 * 
 *     CourseDetailResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Course details retrieved successfully"
 *         data:
 *           type: object
 *           properties:
 *             course:
 *               $ref: '#/components/schemas/Course'
 *             lessons:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Lesson'
 * 
 *     EnrolledCourseDetailResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Course details retrieved successfully"
 *         data:
 *           type: object
 *           properties:
 *             course:
 *               $ref: '#/components/schemas/Course'
 *             enrollment:
 *               $ref: '#/components/schemas/Enrollment'
 *             lessons:
 *               type: array
 *               items:
 *                 allOf:
 *                   - $ref: '#/components/schemas/Lesson'
 *                   - type: object
 *                     properties:
 *                       progress:
 *                         $ref: '#/components/schemas/Progress'
 * 
 *     ReorderLessonsRequest:
 *       type: object
 *       required:
 *         - lessons
 *       properties:
 *         lessons:
 *           type: array
 *           items:
 *             type: object
 *             required:
 *               - id
 *               - order
 *             properties:
 *               id:
 *                 type: string
 *                 example: "60f1b2b3e1b3f4001f789012"
 *               order:
 *                 type: number
 *                 minimum: 1
 *                 example: 1
 */