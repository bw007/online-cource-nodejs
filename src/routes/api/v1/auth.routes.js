const express = require('express');
const passport = require('passport');

const { authenticate, googleAuth, googleCallback } = require('@/middlewares');
const { asyncHandler } = require('@/middlewares');
const { authController } = require('@/controllers');

const router = express.Router();

// LOCAL AUTH ROUTES
router.post('/signin', asyncHandler(authController.signin));
router.post('/signup', asyncHandler(authController.signup));
router.get('/verify', authenticate, asyncHandler(authController.verify));
router.post('/logout', authenticate, asyncHandler(authController.logout));
router.post('/refresh-token', asyncHandler(authController.refreshToken));

router.post('/verify-otp', asyncHandler(authController.verifyOTP));
router.post('/resend-otp', asyncHandler(authController.resendOTP));

// EMAIL CHECK ROUTE - For frontend async validation
router.get('/check-email', asyncHandler(authController.checkEmail));

// GOOGLE OAUTH ROUTES
router.get('/google', googleAuth);

router.get('/google/callback', googleCallback, asyncHandler(authController.googleCallback));

// ACCOUNT LINKING ROUTES
router.post('/link-account', authenticate, asyncHandler(authController.linkAccount));
router.post('/unlink-account', authenticate, asyncHandler(authController.unlinkAccount));
router.get('/connected-accounts', authenticate, asyncHandler(authController.getConnectedAccounts));

module.exports = router;