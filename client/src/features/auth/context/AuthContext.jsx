import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
  updateProfilePicture as updateProfilePictureRequest,
  removeProfilePicture as removeProfilePictureRequest,
} from "../api/authApi";
import AuthContext from "./AuthContext";
import { useLanguage } from "../../i18n/context/useLanguage";

export const AuthProvider = ({ children }) => {
  const { language, setLanguage, t } = useLanguage();
  const [user, setUser] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      const result = await getCurrentUser();
      setUser(result.user || null);
    } catch {
      setUser(null);
    } finally {
      setIsCheckingAuth(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = useCallback(
    async (credentials) => {
      const result = await loginUser(credentials);

      if (result.user) {
        setUser(result.user);
      } else {
        await checkAuth();
      }

      return result;
    },
    [checkAuth],
  );

  const register = useCallback(async (payload) => registerUser(payload), []);

  const logout = useCallback(async () => {
    try {
      await logoutUser();
    } finally {
      setUser(null);
    }
  }, []);

  const updateProfilePicture = useCallback(async (file) => {
    const result = await updateProfilePictureRequest(file);
    if (result.user) {
      setUser(result.user);
    }

    return result;
  }, []);

  const removeProfilePicture = useCallback(async () => {
    const result = await removeProfilePictureRequest();
    if (result.user) {
      setUser(result.user);
    }

    return result;
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isCheckingAuth,
      checkAuth,
      login,
      register,
      logout,
      updateProfilePicture,
      removeProfilePicture,
      language,
      setLanguage,
      t,
    }),
    [
      checkAuth,
      isCheckingAuth,
      login,
      logout,
      language,
      removeProfilePicture,
      register,
      setLanguage,
      t,
      updateProfilePicture,
      user,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
