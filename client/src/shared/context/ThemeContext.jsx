import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import ThemeContext from "./ThemeContext";

const STORAGE_KEY = "w2eat-theme";
const THEMES = ["light", "dark"];

const getInitialTheme = () => {
  try {
    const savedTheme = window.localStorage.getItem(STORAGE_KEY);
    return THEMES.includes(savedTheme) ? savedTheme : "light";
  } catch {
    return "light";
  }
};

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(getInitialTheme);
  const transitionTimer = useRef(null);

  useLayoutEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme;
    root.classList.toggle("dark", theme === "dark");
    root.style.colorScheme = theme;

    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // The active theme still works when storage is unavailable.
    }
  }, [theme]);

  useEffect(
    () => () => {
      window.clearTimeout(transitionTimer.current);
      document.documentElement.classList.remove("theme-changing");
    },
    [],
  );

  const setTheme = useCallback((nextTheme) => {
    if (!THEMES.includes(nextTheme)) return;

    const root = document.documentElement;
    root.classList.add("theme-changing");
    window.clearTimeout(transitionTimer.current);
    transitionTimer.current = window.setTimeout(() => {
      root.classList.remove("theme-changing");
    }, 450);
    setThemeState(nextTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((currentTheme) => {
      const nextTheme = currentTheme === "dark" ? "light" : "dark";
      const root = document.documentElement;
      root.classList.add("theme-changing");
      window.clearTimeout(transitionTimer.current);
      transitionTimer.current = window.setTimeout(() => {
        root.classList.remove("theme-changing");
      }, 450);
      return nextTheme;
    });
  }, []);

  const value = useMemo(
    () => ({
      theme,
      isDark: theme === "dark",
      setTheme,
      toggleTheme,
    }),
    [setTheme, theme, toggleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
