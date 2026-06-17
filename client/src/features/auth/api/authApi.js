const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
const AUTH_BASE_URL = `${API_BASE_URL}/auth`;

const fetchAuthJson = async (url, options = {}) => {
  const response = await fetch(url, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const contentType = response.headers.get("content-type") || "";
  const rawBody = await response.text();

  let result = {};
  if (rawBody && contentType.includes("application/json")) {
    result = JSON.parse(rawBody);
  }

  if (!response.ok) {
    throw new Error(result.message || "Authentication request failed");
  }

  return result;
};

export const registerUser = async (data) =>
  fetchAuthJson(`${AUTH_BASE_URL}/register`, {
    method: "POST",
    body: JSON.stringify({
      username: data.username,
      email: data.email.toLowerCase(),
      password: data.password,
    }),
  });

export const loginUser = async (data) =>
  fetchAuthJson(`${AUTH_BASE_URL}/login`, {
    method: "POST",
    body: JSON.stringify({
      email: data.email.toLowerCase(),
      password: data.password,
    }),
  });

export const getCurrentUser = async () => fetchAuthJson(`${AUTH_BASE_URL}/me`);

export const logoutUser = async () =>
  fetchAuthJson(`${AUTH_BASE_URL}/logout`, {
    method: "POST",
  });

export const changePassword = async (data) =>
  fetchAuthJson(`${AUTH_BASE_URL}/change-password`, {
    method: "PATCH",
    body: JSON.stringify({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    }),
  });
