const express = require("express");
const router = express.Router();

const {
  getCommentsByRecipeId,
  getCommentById,
  createComment,
  updateComment,
  deleteComment,
} = require("../controllers/comment.controller");
const { protect } = require("../middleware/auth.middleware");

/**
 * @swagger
 * tags:
 *   name: Comments
 *   description: კომენტარების მართვა
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     CommentUser:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 65f1a2b3c4d5e6f789012345
 *         username:
 *           type: string
 *           example: mindia
 *         profileImg:
 *           type: string
 *           example: userpfp.avif
 *
 *     Comment:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 680a8f98aabf121234567890
 *         recipe:
 *           type: string
 *           example: 680a8f98aabf129876543210
 *         user:
 *           $ref: '#/components/schemas/CommentUser'
 *         text:
 *           type: string
 *           example: ძალიან გემრიელი გამოვიდა, მადლობა რეცეპტისთვის
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     CreateCommentRequest:
 *       type: object
 *       required:
 *         - text
 *       properties:
 *         text:
 *           type: string
 *           example: This recipe is amazing.
 *
 *     UpdateCommentRequest:
 *       type: object
 *       required:
 *         - text
 *       properties:
 *         text:
 *           type: string
 *           example: Updated comment text.
 */

/**
 * @swagger
 * /comments/recipe/{recipeId}:
 *   get:
 *     summary: ერთი რეცეპტის ყველა კომენტარის მიღება
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: recipeId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: კომენტარების სია
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: number
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Comment'
 *       400:
 *         description: არასწორი recipe id
 */
router.get("/recipe/:recipeId", getCommentsByRecipeId);

/**
 * @swagger
 * /comments/{id}:
 *   get:
 *     summary: ერთი კომენტარის მიღება
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: კომენტარი
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Comment'
 *       404:
 *         description: კომენტარი ვერ მოიძებნა
 */
router.get("/:id", getCommentById);

/**
 * @swagger
 * /comments/recipe/{recipeId}:
 *   post:
 *     summary: კომენტარის დამატება (auth required)
 *     tags: [Comments]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: recipeId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCommentRequest'
 *     responses:
 *       201:
 *         description: კომენტარი წარმატებით შეიქმნა
 *       401:
 *         description: ავტორიზაცია საჭიროა
 */
router.post("/recipe/:recipeId", protect, createComment);

/**
 * @swagger
 * /comments/{id}:
 *   put:
 *     summary: კომენტარის განახლება (owner or admin)
 *     tags: [Comments]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateCommentRequest'
 *     responses:
 *       200:
 *         description: კომენტარი განახლდა
 *       403:
 *         description: მხოლოდ ავტორს ან ადმინს შეუძლია განახლება
 */
router.put("/:id", protect, updateComment);

/**
 * @swagger
 * /comments/{id}:
 *   delete:
 *     summary: კომენტარის წაშლა (owner or admin)
 *     tags: [Comments]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: კომენტარი წაიშალა
 *       403:
 *         description: მხოლოდ ავტორს ან ადმინს შეუძლია წაშლა
 */
router.delete("/:id", protect, deleteComment);

module.exports = router;
