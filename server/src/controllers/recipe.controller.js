const Recipe = require("../models/Recipe");
const recipeCategories = require("../config/recipeCategories");
const {
  uploadBase64Image,
  uploadImagesArray,
} = require("../config/cloudinary.upload");

const canManageRecipe = (recipe, user) => {
  if (!recipe || !user) return false;
  if (user.role === "admin") return true;

  const recipeAuthor = recipe.author?.toString?.().trim();
  const userId = user._id?.toString?.();

  return [userId, user.username, user.email]
    .filter(Boolean)
    .includes(recipeAuthor);
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
    const recipes = await Recipe.find({
      approvalStatus: "pending",
      isPublished: false,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: recipes.length,
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

    await recipe.save();

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

    await recipe.deleteOne();

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

    await recipe.save();

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

    await recipe.save();

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
