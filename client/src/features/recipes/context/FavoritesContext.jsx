import { useEffect, useMemo, useState } from "react";

import { FavoritesContext } from "./FavoritesContext";

const STORAGE_KEY = "w2eat.favoriteRecipes";

const getRecipeId = (recipe) => recipe?._id || recipe?.id;

const readStoredFavorites = () => {
  if (typeof window === "undefined") return [];

  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    const parsed = value ? JSON.parse(value) : [];
    return Array.isArray(parsed) ? parsed.filter(getRecipeId) : [];
  } catch {
    return [];
  }
};

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState(readStoredFavorites);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  }, [favorites]);

  const value = useMemo(() => {
    const favoriteIds = new Set(favorites.map(getRecipeId));

    const isFavorite = (recipeOrId) => {
      const id =
        typeof recipeOrId === "string" ? recipeOrId : getRecipeId(recipeOrId);
      return favoriteIds.has(id);
    };

    const toggleFavorite = (recipe) => {
      const recipeId = getRecipeId(recipe);
      if (!recipeId) return;

      setFavorites((current) => {
        const exists = current.some((item) => getRecipeId(item) === recipeId);
        if (exists) {
          return current.filter((item) => getRecipeId(item) !== recipeId);
        }

        return [{ ...recipe }, ...current];
      });
    };

    return {
      favorites,
      favoriteIds,
      isFavorite,
      toggleFavorite,
    };
  }, [favorites]);

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};
