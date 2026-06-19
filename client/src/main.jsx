import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./features/auth/context/AuthContext.jsx";
import { FavoritesProvider } from "./features/recipes/context/FavoritesContext.jsx";
import { LanguageProvider } from "./features/i18n/context/LanguageContext.jsx";
import { ThemeProvider } from "./shared/context/ThemeContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <FavoritesProvider>
            <App />
          </FavoritesProvider>
        </AuthProvider>
      </LanguageProvider>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "var(--surface-raised)",
            color: "var(--text-primary)",
            border: "1px solid var(--border-color)",
          },
        }}
      />
    </ThemeProvider>
  </StrictMode>,
);
