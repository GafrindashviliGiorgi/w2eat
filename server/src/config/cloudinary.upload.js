const cloudinary = require("./cloudinary");
const multer = require("multer");

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB per image
const MAX_IMAGES_COUNT = 8;
const ALLOWED_IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  // .jpeg .jpg .png .webp გაფართოებების მხარდაჭერა MIME ტიპების გარეშე
]);

const memoryUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_IMAGE_BYTES, files: 1 },
  fileFilter: (_req, file, callback) => {
    if (!ALLOWED_IMAGE_MIME_TYPES.has(file.mimetype.toLowerCase())) {
      callback(
        createValidationError(
          "Unsupported image type. Allowed: jpeg, png, webp",
        ),
      );
      return;
    }

    callback(null, true);
  },
});

const createValidationError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const estimateBase64Bytes = (base64Payload) => {
  const clean = base64Payload.replace(/\s/g, "");
  const padding = clean.endsWith("==") ? 2 : clean.endsWith("=") ? 1 : 0;
  return Math.floor((clean.length * 3) / 4) - padding;
};

const validateAndNormalizeImageInput = (imageData) => {
  if (typeof imageData !== "string") {
    throw createValidationError("Image must be a string value");
  }

  const trimmed = imageData.trim();
  if (!trimmed) {
    throw createValidationError("Image cannot be empty");
  }

  const isRemoteUrl = /^https?:\/\//i.test(trimmed);
  if (isRemoteUrl) {
    if (!trimmed.toLowerCase().startsWith("https://")) {
      throw createValidationError("Only HTTPS image URLs are allowed");
    }

    if (trimmed.length > 2048) {
      throw createValidationError("Image URL is too long");
    }

    return trimmed;
  }

  const dataUriMatch = trimmed.match(
    /^data:(image\/[a-zA-Z0-9.+-]+);base64,([A-Za-z0-9+/=\s]+)$/,
  );
  if (dataUriMatch) {
    const mimeType = dataUriMatch[1].toLowerCase();
    const base64Payload = dataUriMatch[2];

    if (!ALLOWED_IMAGE_MIME_TYPES.has(mimeType)) {
      throw createValidationError(
        "Unsupported image type. Allowed: jpeg, png, webp",
      );
    }

    const imageBytes = estimateBase64Bytes(base64Payload);
    if (imageBytes <= 0) {
      throw createValidationError("Invalid base64 image payload");
    }

    if (imageBytes > MAX_IMAGE_BYTES) {
      throw createValidationError("Each image must be 5MB or smaller", 413);
    }

    return `data:${mimeType};base64,${base64Payload.replace(/\s/g, "")}`;
  }

  const isRawBase64 =
    /^[A-Za-z0-9+/=\s]+$/.test(trimmed) && trimmed.length > 100;
  if (isRawBase64) {
    const imageBytes = estimateBase64Bytes(trimmed);
    if (imageBytes <= 0) {
      throw createValidationError("Invalid base64 image payload");
    }

    if (imageBytes > MAX_IMAGE_BYTES) {
      throw createValidationError("Each image must be 5MB or smaller", 413);
    }

    return `data:image/jpeg;base64,${trimmed.replace(/\s/g, "")}`;
  }

  throw createValidationError(
    "Invalid image format. Use HTTPS URL or base64 data URI",
  );
};

const normalizeBase64Image = (imageData) => {
  if (imageData === undefined || imageData === null) return null;
  return validateAndNormalizeImageInput(imageData);
};

const uploadBase64Image = async (imageData) => {
  const normalized = normalizeBase64Image(imageData);
  if (!normalized || typeof normalized !== "string") return null;

  const isRemoteUrl = /^https?:\/\//i.test(normalized);
  if (isRemoteUrl) return normalized;

  const isBase64 = normalized.startsWith("data:");
  if (!isBase64) return normalized;

  const uploadResponse = await cloudinary.uploader.upload(normalized, {
    folder: "recipes",
  });

  return uploadResponse.secure_url;
};

const uploadImageBuffer = (file) => {
  if (!file?.buffer) {
    throw createValidationError("Profile picture is required");
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "profile-pictures",
        resource_type: "image",
        transformation: [
          { width: 600, height: 600, crop: "fill", gravity: "face" },
          { quality: "auto", fetch_format: "auto" },
        ],
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(result.secure_url);
      },
    );

    uploadStream.end(file.buffer);
  });
};

const getProfileImagePublicId = (imageUrl) => {
  if (!imageUrl) return null;

  try {
    const parsedUrl = new URL(imageUrl);
    if (!parsedUrl.hostname.endsWith("cloudinary.com")) return null;

    const uploadMarker = "/image/upload/";
    const uploadIndex = parsedUrl.pathname.indexOf(uploadMarker);
    if (uploadIndex === -1) return null;

    const uploadPath = decodeURIComponent(
      parsedUrl.pathname.slice(uploadIndex + uploadMarker.length),
    );
    const segments = uploadPath.split("/").filter(Boolean);
    const profileFolderIndex = segments.indexOf("profile-pictures");
    if (profileFolderIndex === -1) return null;

    const publicIdWithExtension = segments.slice(profileFolderIndex).join("/");
    return publicIdWithExtension.replace(/\.[a-zA-Z0-9]+$/, "");
  } catch {
    return null;
  }
};

const deleteUploadedProfileImage = async (imageUrl) => {
  const publicId = getProfileImagePublicId(imageUrl);
  if (!publicId) return false;

  await cloudinary.uploader.destroy(publicId, {
    resource_type: "image",
    invalidate: true,
  });
  return true;
};

const uploadProfilePicture = (req, res, next) => {
  memoryUpload.single("pfp")(req, res, (error) => {
    if (!error) {
      next();
      return;
    }

    const isFileTooLarge = error.code === "LIMIT_FILE_SIZE";
    res.status(isFileTooLarge ? 413 : error.statusCode || 400).json({
      message: isFileTooLarge
        ? "Profile picture must be 5MB or smaller"
        : error.message || "Unable to process profile picture",
    });
  });
};

const uploadImagesArray = async (imagesInput) => {
  if (!Array.isArray(imagesInput)) return undefined;

  if (imagesInput.length > MAX_IMAGES_COUNT) {
    throw createValidationError(
      `Maximum ${MAX_IMAGES_COUNT} images are allowed`,
    );
  }

  const uploaded = await Promise.all(
    imagesInput.filter((item) => item).map((item) => uploadBase64Image(item)),
  );

  return uploaded.filter(Boolean);
};

module.exports = {
  uploadBase64Image,
  uploadImagesArray,
  uploadImageBuffer,
  uploadProfilePicture,
  deleteUploadedProfileImage,
};
