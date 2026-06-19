const express = require("express");
const router = express.Router();

const {
  register,
  login,
  logout,
  getMe,
  changePassword,
  updateProfilePicture,
  removeProfilePicture,
} = require("../controllers/auth.controller");

const { protect } = require("../middleware/auth.middleware");
const { uploadProfilePicture } = require("../config/cloudinary.upload");

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication routes
 */

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     cookieAuth:
 *       type: apiKey
 *       in: cookie
 *       name: token
 *
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: 65f1a2b3c4d5e6f789012345
 *         username:
 *           type: string
 *           example: mindia
 *         email:
 *           type: string
 *           example: test@test.com
 *         profileImg:
 *           type: string
 *           description: Custom avatar URL or the canonical default asset key
 *           example: userpfp.avif
 *
 *     RegisterRequest:
 *       type: object
 *       required:
 *         - username
 *         - email
 *         - password
 *       properties:
 *         username:
 *           type: string
 *           example: mindia
 *         email:
 *           type: string
 *           example: test@test.com
 *         password:
 *           type: string
 *           example: 123456
 *
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           example: test@test.com
 *         password:
 *           type: string
 *           example: 123456
 *
 *     ChangePasswordRequest:
 *       type: object
 *       required:
 *         - currentPassword
 *         - newPassword
 *       properties:
 *         currentPassword:
 *           type: string
 *           example: oldPassword123
 *         newPassword:
 *           type: string
 *           example: newPassword123
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register new user
 *     tags: [Auth]
 *     description: Creates a new user and sets httpOnly JWT cookie
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: User already exists
 *       500:
 *         description: Server error
 */
router.post("/register", register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: User login
 *     tags: [Auth]
 *     description: Authenticates user and sets httpOnly JWT cookie
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         headers:
 *           Set-Cookie:
 *             description: JWT cookie
 *             schema:
 *               type: string
 *       400:
 *         description: Invalid credentials
 *       500:
 *         description: Server error
 */
router.post("/login", login);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current user
 *     tags: [Auth]
 *     description: Returns current logged-in user based on cookie
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Current user fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Not authorized
 */
router.get("/me", protect, getMe);

/**
 * @swagger
 * /auth/change-password:
 *   patch:
 *     summary: Change current user password
 *     tags: [Auth]
 *     description: Updates password using current password verification
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChangePasswordRequest'
 *     responses:
 *       200:
 *         description: Password updated successfully
 *       400:
 *         description: Invalid input or current password is incorrect
 *       401:
 *         description: Not authorized
 *       404:
 *         description: User not found
 */
router.patch("/change-password", protect, changePassword);

/**
 * @swagger
 * /auth/profile/pfp:
 *   put:
 *     summary: Update the current user's profile picture
 *     tags: [Auth]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [pfp]
 *             properties:
 *               pfp:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Profile picture updated successfully
 *       400:
 *         description: A valid image is required
 *       401:
 *         description: Not authorized
 */
router.put(
  "/profile/pfp",
  protect,
  uploadProfilePicture,
  updateProfilePicture,
);

/**
 * @swagger
 * /auth/profile/pfp:
 *   delete:
 *     summary: Remove the current user's custom profile picture
 *     tags: [Auth]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Profile picture removed and reset to the default state
 *       401:
 *         description: Not authorized
 *       404:
 *         description: User not found
 */
router.delete("/profile/pfp", protect, removeProfilePicture);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Auth]
 *     description: Clears authentication cookie
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 *         headers:
 *           Set-Cookie:
 *             description: Clears JWT cookie
 *             schema:
 *               type: string
 *       401:
 *         description: Not authorized
 */
router.post("/logout", logout);

module.exports = router;
