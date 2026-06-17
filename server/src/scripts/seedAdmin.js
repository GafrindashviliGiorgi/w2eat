const connectDB = require("../config/db");
const User = require("../models/User");
const { setServers } = require("node:dns/promises");

/**
 * Seeds one admin user if it does not already exist.
 * When called from server startup, DB should already be connected.
 * When run directly, this file connects to DB itself.
 */
const seedAdmin = async () => {
  const SEED_ADMIN = {
    username: process.env.SEED_ADMIN_USERNAME,
    email: process.env.SEED_ADMIN_EMAIL,
    password: process.env.SEED_ADMIN_PASSWORD,
    role: process.env.SEED_ADMIN_ROLE || "admin",
  };

  if (!SEED_ADMIN.email || !SEED_ADMIN.password) {
    console.warn(
      "Seed skipped: SEED_ADMIN_EMAIL or SEED_ADMIN_PASSWORD is missing",
    );
    return;
  }

  // Fallback username when not provided
  if (!SEED_ADMIN.username) {
    SEED_ADMIN.username = SEED_ADMIN.email.split("@")[0];
  }

  if (!["user", "admin"].includes(SEED_ADMIN.role)) {
    console.warn("Invalid SEED_ADMIN_ROLE. Falling back to 'admin'.");
    SEED_ADMIN.role = "admin";
  }

  const existingAdmin = await User.findOne({ email: SEED_ADMIN.email });

  if (existingAdmin) {
    console.log("Admin already exists. Seed skipped.");
    return;
  }

  const admin = await User.create(SEED_ADMIN);

  console.log("Admin created successfully");
  console.log("-------------------------");
  console.log(`Username: ${admin.username}`);
  console.log(`Email:    ${admin.email}`);
  console.log(`Role:     ${admin.role}`);
  console.log(`ID:       ${admin._id}`);
  console.log("-------------------------");
};

module.exports = seedAdmin;

if (require.main === module) {
  (async () => {
    try {
      require("dotenv").config();
      setServers(["1.1.1.1", "8.8.8.8"]);
      await connectDB();
      await seedAdmin();
      process.exit(0);
    } catch (error) {
      console.error("Seed failed:", error.message);
      process.exit(1);
    }
  })();
}
