const OBJECT_ID_PATTERN = /^[a-f\d]{24}$/i;

const creatorCandidates = (recipe) => [
  recipe?.creator,
  recipe?.createdBy,
  recipe?.user,
  recipe?.owner,
];

export const getRecipeCreatorName = (recipe) => {
  for (const candidate of creatorCandidates(recipe)) {
    if (candidate?.username) return candidate.username;
  }

  if (typeof recipe?.author === "object" && recipe.author?.username) {
    return recipe.author.username;
  }

  if (
    typeof recipe?.author === "string" &&
    recipe.author.trim() &&
    !OBJECT_ID_PATTERN.test(recipe.author.trim())
  ) {
    return recipe.author.trim();
  }

  return "";
};

export const getRecipeCreatorPicture = (recipe) => {
  for (const candidate of creatorCandidates(recipe)) {
    if (candidate?.profileImg) return candidate.profileImg;
  }

  return typeof recipe?.author === "object" ? recipe.author?.profileImg || "" : "";
};
