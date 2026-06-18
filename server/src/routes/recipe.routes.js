const express = require("express");
const router = express.Router();

const {
  getAllRecipes,
  getRecipeById,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  likeRecipe,
  dislikeRecipe,
  getPendingRecipes,
  approveRecipeRequest,
  rejectRecipeRequest,
  getAdminDashboard,
  getRecipeCategories,
} = require("../controllers/recipe.controller");
const { protect, admin } = require("../middleware/auth.middleware");

/**
 * @swagger
 * tags:
 *   name: Recipes
 *   description: რეცეპტების მართვა
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Ingredient:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: ფქვილი
 *         quantity:
 *           type: string
 *           example: 500გ
 *
 *     Step:
 *       type: object
 *       properties:
 *         stepNumber:
 *           type: number
 *           example: 1
 *         instruction:
 *           type: string
 *           example: ცომის მომზადება
 *
 *     Recipe:
 *       type: object
 *       required:
 *         - title
 *         - description
 *       properties:
 *         _id:
 *           type: string
 *           example: 65f123abc123
 *         title:
 *           type: string
 *           example: ხაჭაპური
 *         description:
 *           type: string
 *           example: გემრიელი ქართული კერძი
 *         image:
 *           type: string
 *         images:
 *           type: array
 *           items:
 *             type: string
 *         author:
 *           type: string
 *         ingredients:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Ingredient'
 *         steps:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Step'
 *         cookTime:
 *           type: number
 *           example: 40
 *         servings:
 *           type: number
 *           example: 4
 *         difficulty:
 *           type: string
 *           enum: [easy, medium, hard]
 *         category:
 *           type: string
 *           enum: [High Protein, Low Carb, Vegan, Keto, Gluten Free, Vegetarian, Dairy Free, Low Calorie]
 *           example: High Protein
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *         likes:
 *           type: number
 *           example: 10
 *         isPublished:
 *           type: boolean
 *           example: true
 */

/**
 * @swagger
 * /recipes:
 *   get:
 *     summary: ყველა რეცეპტის მიღება (pagination + filter)
 *     tags: [Recipes]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *         example: 10
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: difficulty
 *         schema:
 *           type: string
 *           enum: [easy, medium, hard]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: რეცეპტების სია
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 pagination:
 *                   type: object
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Recipe'
 */
router.get("/", getAllRecipes);

/**
 * @swagger
 * /recipes/categories:
 *   get:
 *     summary: Get standardized recipe categories
 *     tags: [Recipes]
 *     responses:
 *       200:
 *         description: Recipe category list
 */
router.get("/categories", getRecipeCategories);

router.get("/admin/dashboard", protect, admin, getAdminDashboard);

/**
 * @swagger
 * /recipes/admin/requests:
 *   get:
 *     summary: Pending recipe requests (admin only)
 *     tags: [Recipes]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Pending requests list
 *       403:
 *         description: Admin role required
 */
router.get("/admin/requests", protect, admin, getPendingRecipes);

/**
 * @swagger
 * /recipes/admin/requests/{id}/approve:
 *   patch:
 *     summary: Approve recipe request (admin only)
 *     tags: [Recipes]
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
 *         description: Recipe approved
 *       403:
 *         description: Admin role required
 *       404:
 *         description: Recipe not found
 */
router.patch(
  "/admin/requests/:id/approve",
  protect,
  admin,
  approveRecipeRequest,
);

router.patch(
  "/admin/requests/:id/reject",
  protect,
  admin,
  rejectRecipeRequest,
);

/**
 * @swagger
 * /recipes/{id}:
 *   get:
 *     summary: ერთი რეცეპტის მიღება
 *     tags: [Recipes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: ერთი რეცეპტი
 *       404:
 *         description: ვერ მოიძებნა
 */
router.get("/:id", getRecipeById);

/**
 * @swagger
 * /recipes:
 *   post:
 *     summary: ახალი რეცეპტის შექმნა
 *     tags: [Recipes]
 *     description: Admin publishes immediately, regular users submit for approval.
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Recipe'
 *     responses:
 *       201:
 *         description: წარმატებით შეიქმნა
 *       400:
 *         description: არასწორი მონაცემები
 *       401:
 *         description: ავტორიზაცია საჭიროა
 */
router.post("/", protect, createRecipe);

/**
 * @swagger
 * /recipes/{id}:
 *   put:
 *     summary: სრული განახლება
 *     tags: [Recipes]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Recipe'
 *     responses:
 *       200:
 *         description: განახლდა
 *       403:
 *         description: მხოლოდ ავტორს ან ადმინს შეუძლია განახლება
 */
router.put("/:id", protect, updateRecipe);

/**
 * @swagger
 * /recipes/{id}:
 *   patch:
 *     summary: ნაწილობრივი განახლება
 *     tags: [Recipes]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Recipe'
 *     responses:
 *       200:
 *         description: განახლდა
 *       403:
 *         description: მხოლოდ ავტორს ან ადმინს შეუძლია განახლება
 */
router.patch("/:id", protect, updateRecipe);

/**
 * @swagger
 * /recipes/{id}/like:
 *   patch:
 *     summary: რეცეპტის მოწონება / მოწონების გაუქმება
 *     tags: [Recipes]
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
 *         description: სტატუსი განახლდა
 *       401:
 *         description: ავტორიზაცია საჭიროა
 */
router.patch("/:id/like", protect, likeRecipe);

/**
 * @swagger
 * /recipes/{id}/dislike:
 *   patch:
 *     summary: რეცეპტის dislike / dislike-ის გაუქმება
 *     tags: [Recipes]
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
 *         description: სტატუსი განახლდა
 *       401:
 *         description: ავტორიზაცია საჭიროა
 */
router.patch("/:id/dislike", protect, dislikeRecipe);

/**
 * @swagger
 * /recipes/{id}:
 *   delete:
 *     summary: რეცეპტის წაშლა
 *     tags: [Recipes]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: წაიშალა
 *       403:
 *         description: მხოლოდ ავტორს ან ადმინს შეუძლია წაშლა
 *       404:
 *         description: ვერ მოიძებნა
 */
router.delete("/:id", protect, deleteRecipe);

module.exports = router;
