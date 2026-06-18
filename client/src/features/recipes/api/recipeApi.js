const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const fetchRecipeJson = async (url, options = {}) => {
  const res = await fetch(url, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = await res.json();

  if (!res.ok) {
    const error = new Error(data.message || "Request failed");
    error.status = res.status;
    throw error;
  }

  return data;
};

export const getPendingRecipes = async () =>
  fetchRecipeJson(`${API_BASE_URL}/recipes/admin/requests`);

export const getRecipes = async ({
  page = 1,
  limit = 1000,
  category = "",
} = {}) => {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  if (category) {
    params.set("category", category);
  }

  return fetchRecipeJson(`${API_BASE_URL}/recipes?${params.toString()}`);
};

export const getRecipeCategories = async () => {
  const response = await fetchRecipeJson(`${API_BASE_URL}/recipes/categories`);

  return Array.isArray(response.data) ? response.data : [];
};

export const approveRecipe = async (id) =>
  fetchRecipeJson(`${API_BASE_URL}/recipes/admin/requests/${id}/approve`, {
    method: "PATCH",
  });

export const updateComment = async (commentId, text) =>
  fetchRecipeJson(`${API_BASE_URL}/comments/${commentId}`, {
    method: "PATCH",
    body: JSON.stringify({ text }),
  });

export const deleteComment = async (commentId) =>
  fetchRecipeJson(`${API_BASE_URL}/comments/${commentId}`, {
    method: "DELETE",
  });

export const createRecipe = async (recipeData) => {
  const res = await fetch(`${API_BASE_URL}/recipes`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(recipeData),
  });

  const contentType = res.headers.get("content-type") || "";
  const responseText = await res.text();

  let data = null;
  if (responseText && contentType.includes("application/json")) {
    try {
      data = JSON.parse(responseText);
    } catch {
      throw new Error("Invalid JSON response from server");
    }
  }

  if (!responseText || !contentType.includes("application/json")) {
    if (res.status === 413) {
      throw new Error(
        "Images are too large. Please use smaller images (under 1MB each).",
      );
    }
    if (!res.ok) {
      throw new Error(`Request failed with status ${res.status}.`);
    }
    throw new Error(
      "Server returned a non-JSON response. Check API URL or Vite proxy configuration.",
    );
  }

  if (!res.ok) {
    if (res.status === 413) {
      throw new Error(
        "Images are too large. Please use smaller images (under 1MB each).",
      );
    }
    throw new Error(data.message || "Failed to create recipe");
  }

  return data;
};

export const likeRecipe = async (recipeId) => {
  const res = await fetch(`${API_BASE_URL}/recipes/${recipeId}/like`, {
    method: "PATCH",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to like recipe");
  }

  return data;
};

export const dislikeRecipe = async (recipeId) => {
  const res = await fetch(`${API_BASE_URL}/recipes/${recipeId}/dislike`, {
    method: "PATCH",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to dislike recipe");
  }

  return data;
};
