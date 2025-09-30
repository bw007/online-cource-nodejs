const { Router } = require("express");

const router = Router();

const authRoutes = require('./auth.routes');
const adminRoutes = require('./admin.routes');
const studentRoutes = require('./student.routes');
const publicRoutes = require('./public.routes');
const uploadRoutes = require('./upload.routes');
const streamRoutes = require('./stream.routes');

router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/student', studentRoutes);
router.use('/public', publicRoutes);
router.use('/upload', uploadRoutes);
router.use('/stream', streamRoutes);

module.exports = router;