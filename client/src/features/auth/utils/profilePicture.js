import defaultProfilePicture from "../../../../design/photoDeatails/userpfp.avif";

export const DEFAULT_PROFILE_PICTURE_KEY = "userpfp.avif";

const isDefaultProfilePicture = (value) =>
  !value ||
  value === DEFAULT_PROFILE_PICTURE_KEY ||
  value.endsWith(`/${DEFAULT_PROFILE_PICTURE_KEY}`);

export const resolveProfilePicture = (profilePicture) => {
  const value = typeof profilePicture === "string" ? profilePicture.trim() : "";

  if (isDefaultProfilePicture(value)) {
    return defaultProfilePicture;
  }

  return value;
};

export const hasCustomProfilePicture = (profilePicture) => {
  const value = typeof profilePicture === "string" ? profilePicture.trim() : "";
  return !isDefaultProfilePicture(value);
};

export default defaultProfilePicture;
