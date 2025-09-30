const express = require('express');
const { optionalAuth, asyncHandler } = require('@/middlewares');
const { streamController } = require('@/controllers');

const router = express.Router();

// Video streaming endpoints
router.get('/video/:lessonId', 
  optionalAuth,
  asyncHandler((req, res) => {
    if (req.query.info === 'true') {
      return streamController.getVideoInfo(req, res);
    } else {
      return streamController.streamVideo(req, res);
    }
  })
);

module.exports = router;