/**
 * @swagger
 * components:
 *   schemas:
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: "john.doe@example.com"
 *           description: "User's email address"
 *         password:
 *           type: string
 *           minLength: 8
 *           example: "password123"
 *           description: "User's password (minimum 8 characters)"
 *     
 *     RegisterRequest:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *       properties:
 *         name:
 *           type: string
 *           minLength: 2
 *           maxLength: 200
 *           example: "John Doe"
 *           description: "User's full name"
 *         email:
 *           type: string
 *           format: email
 *           example: "john.doe@example.com"
 *           description: "User's email address"
 *         password:
 *           type: string
 *           minLength: 8
 *           example: "password123"
 *           description: "User's password (minimum 8 characters)"
 *     
 *     UserResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "60f1b2b3e1b3f4001f123456"
 *           description: "User's unique identifier"
 *         name:
 *           type: string
 *           example: "John Doe"
 *           description: "User's full name"
 *         email:
 *           type: string
 *           format: email
 *           example: "john.doe@example.com"
 *           description: "User's email address"
 *         role:
 *           type: string
 *           enum: [admin, student]
 *           example: "student"
 *           description: "User's role in the system"
 *         avatar:
 *           type: string
 *           nullable: true
 *           example: "https://example.com/avatar.jpg"
 *           description: "User's profile picture URL"
 *         isEmailVerified:
 *           type: boolean
 *           example: true
 *           description: "Whether user's email is verified"
 *         provider:
 *           type: string
 *           enum: [local, google]
 *           example: "local"
 *           description: "Authentication provider used"
 *         enrolledCourses:
 *           type: array
 *           items:
 *             type: string
 *           example: ["60f1b2b3e1b3f4001f789012"]
 *           description: "Array of enrolled course IDs"
 *         lastLoginAt:
 *           type: string
 *           format: date-time
 *           example: "2024-01-15T10:30:00Z"
 *           description: "Last login timestamp"
 *     
 *     AuthResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *           description: "Request success status"
 *         message:
 *           type: string
 *           example: "Login successful"
 *           description: "Response message"
 *         timestamp:
 *           type: string
 *           format: date-time
 *           example: "2024-01-15T10:30:00Z"
 *           description: "Response timestamp"
 *         data:
 *           type: object
 *           properties:
 *             user:
 *               $ref: '#/components/schemas/UserResponse'
 *             accessToken:
 *               type: string
 *               example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *               description: "JWT access token"
 *             refreshToken:
 *               type: string
 *               example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *               description: "JWT refresh token"
 *     
 *     LinkAccountRequest:
 *       type: object
 *       required:
 *         - provider
 *         - providerId
 *       properties:
 *         provider:
 *           type: string
 *           enum: [google]
 *           example: "google"
 *           description: "OAuth provider name"
 *         providerId:
 *           type: string
 *           example: "115760456789012345678"
 *           description: "Provider-specific user ID"
 * 
 *     RefreshTokenRequest:
 *       type: object
 *       properties:
 *         refreshToken:
 *           type: string
 *           example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *           description: "JWT refresh token (can be in cookie or body)"
 *     
 *     RefreshTokenResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Token refreshed successfully"
 *         timestamp:
 *           type: string
 *           format: date-time
 *         data:
 *           type: object
 *           properties:
 *             accessToken:
 *               type: string
 *               example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *               description: "New JWT access token"
 *             user:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 email:
 *                   type: string
 *                 role:
 *                   type: string    
 * 
 *     ConnectedAccountsResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Connected accounts retrieved"
 *         data:
 *           type: object
 *           properties:
 *             connectedAccounts:
 *               type: object
 *               properties:
 *                 local:
 *                   type: boolean
 *                   example: true
 *                   description: "Whether local account is available"
 *                 google:
 *                   type: boolean
 *                   example: false
 *                   description: "Whether Google account is connected"
 *                 email:
 *                   type: string
 *                   format: email
 *                   example: "john.doe@example.com"
 *                   description: "User's email address"
 *                 isEmailVerified:
 *                   type: boolean
 *                   example: true
 *                   description: "Email verification status"
 *     
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *           description: "Request success status"
 *         message:
 *           type: string
 *           example: "Invalid email or password"
 *           description: "Error message"
 *         code:
 *           type: string
 *           example: "INVALID_CREDENTIALS"
 *           description: "Error code"
 *         timestamp:
 *           type: string
 *           format: date-time
 *           example: "2024-01-15T10:30:00Z"
 *           description: "Response timestamp"
 *         errors:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               field:
 *                 type: string
 *                 example: "email"
 *               message:
 *                 type: string
 *                 example: "Invalid email format"
 *               value:
 *                 type: string
 *                 example: "invalid-email"
 *           description: "Validation errors (for 422 responses)"
 */