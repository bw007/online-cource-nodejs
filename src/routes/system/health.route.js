const { Router } = require("express");
const config = require("@config");
const { ResponseFormatter } = require("@utils");

const router = Router();

router.get("/", (req, res) => {
  return ResponseFormatter.success(res, {
    message: "Service is healthy",
    data: {
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
      database: config.database.getConnectionStatus(),
    }
  });
});

module.exports = router;