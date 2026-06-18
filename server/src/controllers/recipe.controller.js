const Recipe = require("../models/Recipe");
const Comment = require("../models/Comment");
const User = require("../models/User");
const recipeCategories = require("../config/recipeCategories");
const {
  uploadBase64Image,
  uploadImagesArray,
} = require("../config/cloudinary.upload");

const getIdentityValue = (value) => {
  if (!value) return "";

  if (typeof value === "object") {
    if (value._id) return String(value._id);
    if (value.id) return String(value.id);
    if (value.email) return String(value.email);
    if (value.username) return String(value.username);

    return String(value);
  }

  return String(value);
};

const canManageRecipe = (recipe, user) => {
  if (!recipe || !user) return false;
  if (user.role === "admin") return true;

  const currentUserId = getIdentityValue(user._id || user.id);
  const recipeAuthorId = getIdentityValue(recipe.author);

  if (currentUserId && recipeAuthorId && currentUserId === recipeAuthorId) {
    return true;
  }

  const userIdentities = [user._id, user.id, user.username, user.email]
    .map(getIdentityValue)
    .filter(Boolean);
  const recipeOwnerIdentities = [
    recipe.author,
    recipe.user,
    recipe.userId,
    recipe.creator,
    recipe.creatorId,
    recipe.createdBy,
  ]
    .map(getIdentityValue)
    .filter(Boolean);

  return userIdentities.some((identity) =>
    recipeOwnerIdentities.includes(identity),
  );
};

const getDayKey = (date) => date.toISOString().slice(0, 10);

const getStartOfDay = (date) => {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
};

const getWeekWindow = () => {
  const today = getStartOfDay(new Date());
  const start = new Date(today);
  start.setDate(today.getDate() - 6);

  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return {
      key: getDayKey(date),
      label: date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
    };
  });

  return { start, days };
};

exports.getAllRecipes = async (req, res) => {
  try {
    // 📌 Query params
    const { category, difficulty, search, page = 1, limit = 10 } = req.query;

    // 🧮 Pagination values
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    // 🎯 Filter
    const filter = {};

    // Public list shows only approved/published recipes.
    filter.isPublished = true;

    if (category) {
      if (!recipeCategories.includes(category)) {
        return res.status(400).json({
          success: false,
          message: "Invalid recipe category",
        });
      }

      filter.category = category;
    }
    if (difficulty) filter.difficulty = difficulty;

    if (search) {
      filter.title = { $regex: search, $options: "i" };
    }

    // 📊 Total count
    const totalRecipes = await Recipe.countDocuments(filter);

    // 📄 Data fetch
    const recipes = await Recipe.find(filter)
      .populate({
        path: "comments",
        options: { sort: { createdAt: -1 } },
        populate: {
          path: "user",
          select: "username profileImg",
        },
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber);

    // 📐 Total pages
    const totalPages = Math.ceil(totalRecipes / limitNumber);

    res.status(200).json({
      success: true,

      // 📊 Pagination info
      pagination: {
        totalItems: totalRecipes,
        totalPages,
        currentPage: pageNumber,
        limit: limitNumber,
        hasNextPage: pageNumber < totalPages,
        hasPrevPage: pageNumber > 1,
      },

      data: recipes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch recipes",
      error: error.message,
    });
  }
};

exports.getRecipeCategories = (req, res) => {
  res.status(200).json({
    success: true,
    data: recipeCategories,
  });
};

exports.getAdminDashboard = async (req, res) => {
  try {
    const { start, days } = getWeekWindow();
    const dayMap = new Map(
      days.map((day) => [
        day.key,
        {
          ...day,
          added: 0,
          published: 0,
        },
      ]),
    );

    const [
      totalRecipes,
      publishedRecipes,
      totalUsers,
      totalComments,
      pendingCount,
      approvedCount,
      rejectedCount,
      newRecipesThisWeek,
      newUsersThisWeek,
      newCommentsThisWeek,
      chartRows,
      topCategories,
      recentRecipes,
      latestComments,
      roleCounts,
    ] = await Promise.all([
      Recipe.countDocuments(),
      Recipe.countDocuments({ isPublished: true }),
      User.countDocuments(),
      Comment.countDocuments(),
      Recipe.countDocuments({ approvalStatus: "pending" }),
      Recipe.countDocuments({ approvalStatus: "approved" }),
      Recipe.countDocuments({ approvalStatus: "rejected" }),
      Recipe.countDocuments({ createdAt: { $gte: start } }),
      User.countDocuments({ createdAt: { $gte: start } }),
      Comment.countDocuments({ createdAt: { $gte: start } }),
      Recipe.aggregate([
        { $match: { createdAt: { $gte: start } } },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$createdAt",
              },
            },
            added: { $sum: 1 },
            published: {
              $sum: {
                $cond: [{ $eq: ["$isPublished", true] }, 1, 0],
              },
            },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Recipe.aggregate([
        { $match: { category: { $exists: true, $ne: "" } } },
        {
          $group: {
            _id: "$category",
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1, _id: 1 } },
        { $limit: 5 },
      ]),
      Recipe.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select(
          "title author category image images approvalStatus isPublished createdAt",
        )
        .lean(),
      Comment.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("user", "username email profileImg role")
        .populate("recipe", "title category")
        .lean(),
      User.aggregate([
        {
          $group: {
            _id: "$role",
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    chartRows.forEach((row) => {
      const day = dayMap.get(row._id);
      if (!day) return;

      day.added = row.added;
      day.published = row.published;
    });

    const roles = roleCounts.reduce(
      (acc, row) => ({
        ...acc,
        [row._id || "user"]: row.count,
      }),
      {},
    );

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalRecipes,
          publishedRecipes,
          categories: recipeCategories.length,
          users: totalUsers,
          comments: totalComments,
          newRecipesThisWeek,
          newUsersThisWeek,
          newCommentsThisWeek,
          requests: {
            pending: pendingCount,
            approved: approvedCount,
            rejected: rejectedCount,
          },
        },
        chart: Array.from(dayMap.values()),
        topCategories: topCategories.map((category) => ({
          name: category._id,
          count: category.count,
        })),
        recentRecipes: recentRecipes.map((recipe) => ({
          ...recipe,
          status:
            recipe.approvalStatus || (recipe.isPublished ? "approved" : "pending"),
        })),
        latestComments: latestComments.map((comment) => ({
          _id: comment._id,
          text: comment.text,
          createdAt: comment.createdAt,
          status: "approved",
          user: comment.user,
          recipe: comment.recipe,
        })),
        roles: {
          admins: roles.admin || 0,
          members: roles.user || 0,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch admin dashboard",
      error: error.message,
    });
  }
};

//
// 📌 GET SINGLE RECIPE BY ID
//
exports.getRecipeById = async (req, res) => {
  try {
    const { id } = req.params;

    const recipe = await Recipe.findById(id).populate({
      path: "comments",
      options: { sort: { createdAt: -1 } },
      populate: {
        path: "user",
        select: "username profileImg",
      },
    });

    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: "Recipe not found",
      });
    }

    if (!recipe.isPublished) {
      return res.status(404).json({
        success: false,
        message: "Recipe not found",
      });
    }

    res.status(200).json({
      success: true,
      data: recipe,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch recipe",
      error: error.message,
    });
  }
};

//
// 📌 CREATE NEW RECIPE
//
exports.createRecipe = async (req, res) => {
  try {
    const {
      title,
      description,
      image,
      images,
      author,
      ingredients,
      steps,
      cookTime,
      servings,
      difficulty,
      category,
      tags,
    } = req.body;

    // 🛑 Basic validation
    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: "Title and description are required",
      });
    }

    if (!category || !recipeCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: "Please choose a valid recipe category",
      });
    }

    const isAdmin = req.user?.role === "admin";
    const recipeAuthor = req.user?._id?.toString() || author;

    const imageUrl = image ? await uploadBase64Image(image) : undefined;
    const imagesUrls = await uploadImagesArray(images);

    // 🧠 Create recipe
    const newRecipe = await Recipe.create({
      title,
      description,
      image: imageUrl || image,
      images: imagesUrls?.length ? imagesUrls : images,
      author: recipeAuthor,
      ingredients,
      steps,
      cookTime,
      servings,
      difficulty,
      category,
      tags,
      isPublished: isAdmin,
      approvalStatus: isAdmin ? "approved" : "pending",
      approvedBy: isAdmin ? req.user._id : null,
      approvedAt: isAdmin ? new Date() : null,
    });

    res.status(201).json({
      success: true,
      message: isAdmin
        ? "Recipe created successfully"
        : "Recipe submitted for admin approval",
      data: newRecipe,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to create recipe",
      error: error.message,
    });
  }
};

//
// 📌 ADMIN - GET PENDING RECIPE REQUESTS
//
exports.getPendingRecipes = async (req, res) => {
  try {
    const statuses = ["pending", "approved", "rejected"];
    const requestedStatus = statuses.includes(req.query.status)
      ? req.query.status
      : "pending";

    const filter = {
      approvalStatus: requestedStatus,
    };

    const [recipes, pendingCount, approvedCount, rejectedCount] =
      await Promise.all([
        Recipe.find(filter).sort({ createdAt: -1 }),
        Recipe.countDocuments({ approvalStatus: "pending" }),
        Recipe.countDocuments({ approvalStatus: "approved" }),
        Recipe.countDocuments({ approvalStatus: "rejected" }),
      ]);

    res.status(200).json({
      success: true,
      count: recipes.length,
      status: requestedStatus,
      counts: {
        pending: pendingCount,
        approved: approvedCount,
        rejected: rejectedCount,
      },
      data: recipes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch pending recipe requests",
      error: error.message,
    });
  }
};

//
// 📌 ADMIN - APPROVE RECIPE REQUEST
//
exports.approveRecipeRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const recipe = await Recipe.findById(id);

    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: "Recipe not found",
      });
    }

    recipe.approvalStatus = "approved";
    recipe.isPublished = true;
    recipe.approvedBy = req.user._id;
    recipe.approvedAt = new Date();

    await recipe.save({ validateModifiedOnly: true });

    res.status(200).json({
      success: true,
      message: "Recipe approved successfully",
      data: recipe,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to approve recipe request",
      error: error.message,
    });
  }
};

//
// 📌 DELETE RECIPE
//
exports.rejectRecipeRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const recipe = await Recipe.findById(id);

    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: "Recipe not found",
      });
    }

    recipe.approvalStatus = "rejected";
    recipe.isPublished = false;
    recipe.approvedBy = req.user._id;
    recipe.approvedAt = new Date();

    await recipe.save({ validateModifiedOnly: true });

    res.status(200).json({
      success: true,
      message: "Recipe rejected successfully",
      data: recipe,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to reject recipe request",
      error: error.message,
    });
  }
};

exports.deleteRecipe = async (req, res) => {
  try {
    const { id } = req.params;

    const recipe = await Recipe.findById(id);

    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: "Recipe not found",
      });
    }

    if (!canManageRecipe(recipe, req.user)) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own recipe",
      });
    }

    await Promise.all([
      Comment.deleteMany({ recipe: recipe._id }),
      recipe.deleteOne(),
    ]);

    res.status(200).json({
      success: true,
      message: "Recipe deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete recipe",
      error: error.message,
    });
  }
};

//
// 📌 UPDATE RECIPE
//
exports.updateRecipe = async (req, res) => {
  try {
    const { id } = req.params;

    const recipe = await Recipe.findById(id);

    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: "Recipe not found",
      });
    }

    if (!canManageRecipe(recipe, req.user)) {
      return res.status(403).json({
        success: false,
        message: "You can only edit your own recipe",
      });
    }

    const {
      title,
      description,
      image,
      images,
      author,
      ingredients,
      steps,
      cookTime,
      servings,
      difficulty,
      category,
      tags,
    } = req.body;

    // 🛑 მინიმალური validation
    if (title !== undefined && title.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Title cannot be empty",
      });
    }

    if (description !== undefined && description.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Description cannot be empty",
      });
    }

    if (category !== undefined && !recipeCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: "Please choose a valid recipe category",
      });
    }

    const imageUrl = image ? await uploadBase64Image(image) : undefined;
    const imagesUrls = images ? await uploadImagesArray(images) : undefined;

    // 🧠 Update object (whitelisting)
    const updateData = {
      title,
      description,
      image: imageUrl || image,
      images: imagesUrls?.length ? imagesUrls : images,
      author,
      ingredients,
      steps,
      cookTime,
      servings,
      difficulty,
      category,
      tags,
    };

    // remove undefined fields (clean update)
    Object.keys(updateData).forEach(
      (key) => updateData[key] === undefined && delete updateData[key],
    );

    const updatedRecipe = await Recipe.findByIdAndUpdate(id, updateData, {
      new: true, // დაბრუნდეს განახლებული მონაცემი
      runValidators: true, // mongoose validation
    });

    res.status(200).json({
      success: true,
      message: "Recipe updated successfully",
      data: updatedRecipe,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to update recipe",
      error: error.message,
    });
  }
};

//
// 📌 LIKE / UNLIKE RECIPE
//
exports.likeRecipe = async (req, res) => {
  try {
    // 🧑‍🍳 მომხმარებლის ID და რეცეპტის ID
    const { id } = req.params;
    const userId = req.user._id.toString();

    const recipe = await Recipe.findById(id);

    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: "Recipe not found",
      });
    }

    const hasLiked = recipe.likedBy.some((user) => user.toString() === userId);
    const hasDisliked = recipe.dislikedBy.some(
      (user) => user.toString() === userId,
    );

    if (hasLiked) {
      recipe.likedBy.pull(req.user._id);
      recipe.likes = Math.max(recipe.likes - 1, 0);
    } else {
      recipe.likedBy.push(req.user._id);
      recipe.likes += 1;
    }

    if (hasDisliked) {
      recipe.dislikedBy.pull(req.user._id);
      recipe.dislikes = Math.max(recipe.dislikes - 1, 0);
    }

    await recipe.save({ validateModifiedOnly: true });

    res.status(200).json({
      success: true,
      message: hasLiked ? "Recipe unliked" : "Recipe liked",
      data: {
        recipeId: recipe._id,
        likes: recipe.likes,
        dislikes: recipe.dislikes,
        isLiked: !hasLiked,
        isDisliked: false,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to like recipe",
      error: error.message,
    });
  }
};

//
// 📌 DISLIKE / REMOVE DISLIKE RECIPE
//
exports.dislikeRecipe = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id.toString();

    const recipe = await Recipe.findById(id);

    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: "Recipe not found",
      });
    }

    const hasLiked = recipe.likedBy.some((user) => user.toString() === userId);
    const hasDisliked = recipe.dislikedBy.some(
      (user) => user.toString() === userId,
    );

    if (hasDisliked) {
      recipe.dislikedBy.pull(req.user._id);
      recipe.dislikes = Math.max(recipe.dislikes - 1, 0);
    } else {
      recipe.dislikedBy.push(req.user._id);
      recipe.dislikes += 1;
    }

    if (hasLiked) {
      recipe.likedBy.pull(req.user._id);
      recipe.likes = Math.max(recipe.likes - 1, 0);
    }

    await recipe.save({ validateModifiedOnly: true });

    res.status(200).json({
      success: true,
      message: hasDisliked ? "Recipe dislike removed" : "Recipe disliked",
      data: {
        recipeId: recipe._id,
        likes: recipe.likes,
        dislikes: recipe.dislikes,
        isLiked: false,
        isDisliked: !hasDisliked,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to dislike recipe",
      error: error.message,
    });
  }
};
