const { ResponseFormatter } = require('@/utils');
const express = require('express');

const router = express.Router();

router.get('/', (req, res) => {
  return ResponseFormatter.success(res, {
    message: 'API ready',
    data: {
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development'
    }
  });
});

module.exports = router;
