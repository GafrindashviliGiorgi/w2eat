const mongoose = require("mongoose");
const Comment = require("../models/Comment");
const Recipe = require("../models/Recipe");

exports.getCommentsByRecipeId = async (req, res) => {
  try {
    const { recipeId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(recipeId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid recipe id",
      });
    }

    const comments = await Comment.find({ recipe: recipeId })
      .populate("user", "username profileImg")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: comments.length,
      data: comments,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch comments",
      error: error.message,
    });
  }
};

exports.getCommentById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid comment id",
      });
    }

    const comment = await Comment.findById(id).populate(
      "user",
      "username profileImg",
    );

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: comment,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch comment",
      error: error.message,
    });
  }
};

exports.createComment = async (req, res) => {
  try {
    const { recipeId } = req.params;
    const { text } = req.body;

    if (!mongoose.Types.ObjectId.isValid(recipeId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid recipe id",
      });
    }

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: "Comment text is required",
      });
    }

    const recipeExists = await Recipe.findById(recipeId);

    if (!recipeExists) {
      return res.status(404).json({
        success: false,
        message: "Recipe not found",
      });
    }

    const comment = await Comment.create({
      recipe: recipeId,
      user: req.user._id,
      text: text.trim(),
    });

    const populatedComment = await Comment.findById(comment._id).populate(
      "user",
      "username profileImg",
    );

    return res.status(201).json({
      success: true,
      message: "Comment created successfully",
      data: populatedComment,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create comment",
      error: error.message,
    });
  }
};

exports.updateComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid comment id",
      });
    }

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: "Comment text is required",
      });
    }

    const comment = await Comment.findById(id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    const isOwner = comment.user.toString() === req.user._id.toString();
    const isAdmin = req.user?.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "You can update only your own comments",
      });
    }

    comment.text = text.trim();
    await comment.save();

    const populatedComment = await Comment.findById(comment._id).populate(
      "user",
      "username profileImg",
    );

    return res.status(200).json({
      success: true,
      message: "Comment updated successfully",
      data: populatedComment,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update comment",
      error: error.message,
    });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid comment id",
      });
    }

    const comment = await Comment.findById(id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    const isOwner = comment.user.toString() === req.user._id.toString();
    const isAdmin = req.user?.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "You can delete only your own comments",
      });
    }

    await comment.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Comment deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete comment",
      error: error.message,
    });
  }
};
