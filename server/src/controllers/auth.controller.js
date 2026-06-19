const ms = require("ms");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const {
  uploadImageBuffer,
  deleteUploadedProfileImage,
} = require("../config/cloudinary.upload");
const { DEFAULT_PROFILE_PICTURE } = require("../config/profile");

const removeCloudinaryProfileImage = async (imageUrl) => {
  try {
    await deleteUploadedProfileImage(imageUrl);
  } catch (error) {
    console.warn("Unable to delete old Cloudinary profile image:", error.message);
  }
};

// helper: generate token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// ✅ REGISTER
const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const user = await User.create({
      username,
      email,
      password,
      profileImg: DEFAULT_PROFILE_PICTURE,
    });

    const token = generateToken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: ms(process.env.JWT_EXPIRES_IN),
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profileImg: user.profileImg,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// ✅ LOGIN
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    const token = generateToken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: ms(process.env.JWT_EXPIRES_IN),
    });

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profileImg: user.profileImg,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// ✅ LOGOUT
const logout = async (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0), // expire immediately
  });

  res.status(200).json({
    message: "Logged out successfully",
  });
};

// ✅ GET CURRENT USER (/me)
const getMe = async (req, res) => {
  res.status(200).json({
    user: req.user,
  });
};

// ✅ CHANGE PASSWORD
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "Current password and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "New password must be at least 6 characters",
      });
    }

    const user = await User.findById(req.user._id).select("+password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const isCurrentPasswordValid = await user.comparePassword(currentPassword);

    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        message: "Current password is incorrect",
      });
    }

    const isSamePassword = await user.comparePassword(newPassword);

    if (isSamePassword) {
      return res.status(400).json({
        message: "New password must be different from current password",
      });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      message: "Password updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// UPDATE PROFILE PICTURE
const updateProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "Profile picture is required",
      });
    }

    const previousProfileImg = req.user.profileImg;
    const profileImg = await uploadImageBuffer(req.file);
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { profileImg },
      { new: true, runValidators: true },
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (previousProfileImg && previousProfileImg !== profileImg) {
      await removeCloudinaryProfileImage(previousProfileImg);
    }

    return res.status(200).json({
      message: "Profile picture updated successfully",
      user,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message:
        error.statusCode && error.statusCode < 500
          ? error.message
          : "Unable to update profile picture",
    });
  }
};

// REMOVE PROFILE PICTURE
const removeProfilePicture = async (req, res) => {
  try {
    const previousProfileImg = req.user.profileImg;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { profileImg: DEFAULT_PROFILE_PICTURE },
      { new: true, runValidators: true },
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (previousProfileImg) {
      await removeCloudinaryProfileImage(previousProfileImg);
    }

    return res.status(200).json({
      message: "Profile picture removed successfully",
      user,
    });
  } catch {
    return res.status(500).json({
      message: "Unable to remove profile picture",
    });
  }
};

module.exports = {
  register,
  login,
  logout,
  getMe,
  changePassword,
  updateProfilePicture,
  removeProfilePicture,
};
