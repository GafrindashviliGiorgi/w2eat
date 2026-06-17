const mongoose = require("mongoose");

const recipeSchema = new mongoose.Schema(
  {
    // 🧾 ძირითადი ინფორმაცია
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },

    // 🖼️ სურათები
    image: {
      type: String, // მთავარი სურათი
    },
    images: [
      {
        type: String, // დამატებითი სურათები
      },
    ],

    // 🧑‍🍳 ავტორი
    author: {
      type: String, // ან ObjectId (თუ Users დაამატებ მომავალში)
    },

    // 🧂 ინგრედიენტები
    ingredients: [
      {
        name: { type: String, required: true },
        quantity: { type: String }, // "2 cups", "1 tbsp"
      },
    ],

    // 📋 მომზადების ნაბიჯები
    steps: [
      {
        stepNumber: Number,
        instruction: String,
      },
    ],
    cookTime: {
      type: Number, // ხარშვის/ცხობის დრო
    },
    // 🍽️ პორციები და სირთულე
    servings: {
      type: Number,
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "easy",
    },

    // 🏷️ კატეგორიები და ტეგები
    category: {
      type: String, // "Dessert", "Main Course"
    },
    tags: [
      {
        type: String, // "vegan", "quick", "healthy"
      },
    ],

    // ❤️ ფავორიტები
    likes: {
      type: Number,
      default: 0,
    },
    dislikes: {
      type: Number,
      default: 0,
    },
    likedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    dislikedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // 🔒 სტატუსი
    isPublished: {
      type: Boolean,
      default: true,
    },
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "approved",
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    approvedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

recipeSchema.virtual("comments", {
  ref: "Comment",
  localField: "_id",
  foreignField: "recipe",
});

module.exports = mongoose.model("Recipe", recipeSchema);
