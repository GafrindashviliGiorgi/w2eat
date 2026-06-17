const cloudinary = require("./cloudinary");

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB per image
const MAX_IMAGES_COUNT = 8;
const ALLOWED_IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  // .jpeg .jpg .png .webp გაფართოებების მხარდაჭერა MIME ტიპების გარეშე
]);

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
};
