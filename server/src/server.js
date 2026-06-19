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
const configuredClientUrls = (process.env.CLIENT_URL || "")
  .split(",")
  .map((url) => url.trim())
  .filter(Boolean);
const developmentClientUrls = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];
const allowedOrigins = new Set([
  ...(configuredClientUrls.length ? configuredClientUrls : developmentClientUrls),
  ...(process.env.NODE_ENV === "production" ? [] : developmentClientUrls),
]);

// CORS configuration
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`Origin ${origin} is not allowed by CORS`));
    },
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
