"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const individualUserAuth_controller_1 = require("../individualUserAuth/individualUserAuth.controller");
const asyncHandler_middleware_1 = require("../../../middlewares/asyncHandler.middleware");
const socialAuth_controller_1 = require("../individualUserAuth/socialAuth.controller");
const individualRouter = (0, express_1.Router)();
/**
 * @swagger
 * tags:
 *   name: IndividualUserAuth
 *   description: API endpoints to manage individual user authentication
 */
/**
 * @swagger
 * /auth/individual/signup:
 *   post:
 *     summary: Register a new individual user
 *     tags: [IndividualUserAuth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - phone_number
 *               - password
 *               - confirm_password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               phone_number:
 *                 type: string
 *               password:
 *                 type: string
 *                 minLength: 6
 *               confirm_password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Verification email sent
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */
individualRouter.route("/signup").post(individualUserAuth_controller_1.individualUserRegistration);
/**
 * @swagger
 * /auth/individual/login:
 *   post:
 *     summary: Login individual user
 *     tags: [IndividualUserAuth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful (tokens or OTP)
 *         content:
 *           application/json:
 *             oneOf:
 *               - $ref: '#/components/schemas/LoginSuccessUser'
 *               - $ref: '#/components/schemas/LoginSuccessAdminOTP'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Invalid credentials
 *       403:
 *         description: Email not verified
 *       404:
 *         description: User not found
 */
individualRouter.route("/login").post((0, asyncHandler_middleware_1.asyncHandler)(individualUserAuth_controller_1.individualUserLogin));
/**
 * @swagger
 * /auth/individual/forgot-password:
 *   post:
 *     summary: Request password reset
 *     tags: [IndividualUserAuth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Reset link sent (if email exists)
 *       400:
 *         description: Email required
 *       500:
 *         description: Server error
 */
individualRouter.route("/forgot-password").post((0, asyncHandler_middleware_1.asyncHandler)(individualUserAuth_controller_1.forgotPassword));
/**
 * @swagger
 * /auth/individual/reset-password:
 *   post:
 *     summary: Reset password with token
 *     tags: [IndividualUserAuth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - password
 *             properties:
 *               token:
 *                 type: string
 *               password:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Invalid/expired token
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
individualRouter
    .route("/reset-password")
    .post((0, asyncHandler_middleware_1.asyncHandler)(individualUserAuth_controller_1.resetIndividualPassword));
/**
 * @swagger
 * /auth/individual/verify-email:
 *   get:
 *     summary: Verify user email
 *     tags: [IndividualUserAuth]
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: JWT verification token
 *     responses:
 *       200:
 *         description: Email verified
 *       400:
 *         description: Invalid/expired token
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
individualRouter.route("/verify-email").get((0, asyncHandler_middleware_1.asyncHandler)(individualUserAuth_controller_1.verifyEmail));
// Social Login Routes
/**
 * @swagger
 * /auth/individual/google:
 *   post:
 *     summary: Google social login
 *     tags: [IndividualUserAuth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [credential]
 *             properties:
 *               credential:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login success
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SocialLoginSuccess'
 *       400:
 *         description: Invalid token
 *       403:
 *         description: Admin blocked
 */
individualRouter.post("/google", (0, asyncHandler_middleware_1.asyncHandler)(socialAuth_controller_1.handleGoogleLogin));
/**
 * @swagger
 * /auth/individual/facebook:
 *   post:
 *     summary: Facebook social login
 *     tags: [IndividualUserAuth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [accessToken]
 *             properties:
 *               accessToken:
 *                 type: string
 */
individualRouter.post("/facebook", (0, asyncHandler_middleware_1.asyncHandler)(socialAuth_controller_1.handleFacebookLogin));
/**
 * @swagger
 * /auth/individual/x:
 *   post:
 *     summary: X (Twitter) social login
 *     tags: [IndividualUserAuth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [oauth_token, oauth_verifier]
 *             properties:
 *               oauth_token:
 *                 type: string
 *               oauth_verifier:
 *                 type: string
 */
individualRouter.post("/x", (0, asyncHandler_middleware_1.asyncHandler)(socialAuth_controller_1.handleXLogin));
exports.default = individualRouter;
