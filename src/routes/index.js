const { validateInput, sanitizeInput, detectSuspiciousActivity } = require("@/middlewares/shared/sanitize");
const { Router } = require("express");

const router = Router();

// Apply global sanitization middleware
router.use(validateInput);
router.use(sanitizeInput);
router.use(detectSuspiciousActivity);

// Test endpoints
router.use("/", require("./system"));

// API routes
router.use("/v1", require("./api/v1"));

module.exports = router;