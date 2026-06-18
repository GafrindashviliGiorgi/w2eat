import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import { useAuth } from "../../auth/context/useAuth";
import { getRecipes, likeRecipe } from "../api/recipeApi";
import { FavoritesContext } from "./FavoritesContext";

const STORAGE_KEY = "w2eat.favoriteRecipes";

const getRecipeId = (recipe) => {
  if (!recipe) return "";
  if (typeof recipe === "string") return recipe;
  return String(recipe._id || recipe.id || "");
};

const getUserId = (user) => {
  if (!user) return "";
  return String(user._id || user.id || "");
};

const recipeIsLikedByUser = (recipe, userId) =>
  Array.isArray(recipe?.likedBy) &&
  recipe.likedBy.some((likedUser) => {
    const likedUserId =
      typeof likedUser === "string" ? likedUser : likedUser?._id || likedUser?.id;
    return String(likedUserId || "") === userId;
  });

const readStoredFavorites = (storageKey = STORAGE_KEY) => {
  if (typeof window === "undefined") return [];

  try {
    const value = window.localStorage.getItem(storageKey);
    const parsed = value ? JSON.parse(value) : [];
    return Array.isArray(parsed) ? parsed.filter(getRecipeId) : [];
  } catch {
    return [];
  }
};

export const FavoritesProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [favorites, setFavorites] = useState(readStoredFavorites);
  const [favoriteOverrides, setFavoriteOverrides] = useState({});
  const [isSyncingFavorites, setIsSyncingFavorites] = useState(false);
  const userId = getUserId(user);
  const storageKey = userId ? `${STORAGE_KEY}.${userId}` : STORAGE_KEY;

  useEffect(() => {
    setFavorites(readStoredFavorites(storageKey));
    setFavoriteOverrides({});
  }, [storageKey]);

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(favorites));
  }, [favorites, storageKey]);

  const refreshFavorites = useCallback(async () => {
    if (!isAuthenticated || !userId) return;

    try {
      setIsSyncingFavorites(true);
      const result = await getRecipes({ page: 1, limit: 1000 });
      const likedRecipes = Array.isArray(result?.data)
        ? result.data.filter((recipe) => recipeIsLikedByUser(recipe, userId))
        : [];

      setFavorites(likedRecipes);
    } catch (error) {
      console.error("Failed to sync favorite recipes", error);
    } finally {
      setIsSyncingFavorites(false);
    }
  }, [isAuthenticated, userId]);

  useEffect(() => {
    refreshFavorites();
  }, [refreshFavorites]);

  const value = useMemo(() => {
    const favoriteIds = new Set(favorites.map(getRecipeId));

    const isFavorite = (recipeOrId) => {
      const id = getRecipeId(recipeOrId);
      if (!id) return false;

      if (Object.prototype.hasOwnProperty.call(favoriteOverrides, id)) {
        return favoriteOverrides[id];
      }

      return (
        favoriteIds.has(id) ||
        (typeof recipeOrId === "object" &&
          recipeIsLikedByUser(recipeOrId, userId))
      );
    };

    const toggleFavorite = (recipe) => {
      const recipeId = getRecipeId(recipe);
      if (!recipeId) return;

      if (!isAuthenticated) {
        toast.error("Please sign in to save favorite recipes");
        return;
      }

      const wasFavorite = isFavorite(recipe);
      const nextFavorite = !wasFavorite;

      setFavoriteOverrides((current) => ({
        ...current,
        [recipeId]: nextFavorite,
      }));

      setFavorites((current) => {
        const exists = current.some((item) => getRecipeId(item) === recipeId);
        if (!nextFavorite) {
          return current.filter((item) => getRecipeId(item) !== recipeId);
        }

        return exists ? current : [{ ...recipe }, ...current];
      });

      likeRecipe(recipeId)
        .then((result) => {
          const isLiked = Boolean(result?.data?.isLiked);

          setFavoriteOverrides((current) => ({
            ...current,
            [recipeId]: isLiked,
          }));

          setFavorites((current) => {
            const exists = current.some(
              (item) => getRecipeId(item) === recipeId,
            );

            if (isLiked && !exists) {
              return [{ ...recipe }, ...current];
            }

            if (!isLiked && exists) {
              return current.filter((item) => getRecipeId(item) !== recipeId);
            }

            return current;
          });
        })
        .catch((error) => {
          console.error("Failed to update favorite status", error);
          toast.error(error.message || "Failed to update favorite");
          setFavoriteOverrides((current) => ({
            ...current,
            [recipeId]: wasFavorite,
          }));
          setFavorites((current) => {
            const exists = current.some(
              (item) => getRecipeId(item) === recipeId,
            );

            if (wasFavorite && !exists) {
              return [{ ...recipe }, ...current];
            }

            if (!wasFavorite && exists) {
              return current.filter((item) => getRecipeId(item) !== recipeId);
            }

            return current;
          });
        });
    };

    return {
      favorites,
      favoriteIds,
      isFavorite,
      isSyncingFavorites,
      refreshFavorites,
      toggleFavorite,
    };
  }, [
    favoriteOverrides,
    favorites,
    isAuthenticated,
    isSyncingFavorites,
    refreshFavorites,
    userId,
  ]);

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};
