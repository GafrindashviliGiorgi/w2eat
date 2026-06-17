const express = require("express");
const cors = require("cors");
require("dotenv").config();

const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/auth.routes");
const recipeRoutes = require("./routes/recipe.routes");
const commentRoutes = require("./routes/comment.routes");

const connectDB = require("./config/db");
const seedAdmin = require("./scripts/seedAdmin");
const swaggerDocs = require("./config/swagger");

const { setServers } = require("node:dns/promises");
const { globalLimiter } = require("./middleware/rateLimiter.middleware");
setServers(["1.1.1.1", "8.8.8.8"]);

const app = express();

// Environment variables
const PORT = process.env.PORT || 3000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

// CORS configuration
app.use(
  cors({
    origin: CLIENT_URL,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  }),
);

// Middleware (JSON parsing)
app.use(cookieParser());
app.use(express.json());

app.use("/api", globalLimiter); // <-- 🆕 ვადებთ ყველა /api-ით დაწყებულ როუტს გლობალურად!

// Route
app.get("/", (req, res) => {
  res.send("Hello World");
});

// Use recipe routes
app.use("/api/recipes", recipeRoutes); // <-- all recipe routes now start with /api/recipes
// Example:
// GET /api/recipes
// GET /api/recipes/:id
// POST /api/recipes
// PUT /api/recipes/:id
// PATCH /api/recipes/:id
// DELETE /api/recipes/:id

// Use auth routes
app.use("/api/auth", authRoutes);

// Use comment routes
app.use("/api/comments", commentRoutes);

// ✅ Swagger (დაუძახე აქ)
swaggerDocs(app);

const startServer = async () => {
  try {
    await connectDB();
    await seedAdmin();

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
