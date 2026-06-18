import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Recipes from "./pages/Recipes";
import Header from "./features/shared/components/Header";
import RecipeDetails from "./pages/RecipeDetails";
import CreateRecipe from "./pages/CreateRecipe";
import EditRecipe from "./pages/EditRecipe";
import Register from "./pages/Register";
import Login from "./pages/Login";
import ChangePassword from "./pages/ChangePassword";
import AdminDashboard from "./pages/admin/AdminDashboard";
import PendingRecipesPage from "./pages/admin/PendingRecipesPage";
import ProtectedRoute from "./features/auth/components/ProtectedRoute";
import PublicRoute from "./features/auth/components/PublicRoute";
import AdminRoute from "./features/auth/components/AdminRoute";

const AppRoutes = () => {
  const location = useLocation();

  return (
    <main
      key={location.pathname}
      className="route-transition min-h-[calc(100vh-88px)]"
    >
      <Routes location={location}>
        <Route path="/" element={<Home />} />

        <Route element={<PublicRoute />}>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
        </Route>

        <Route path="/recipes" element={<Recipes />} />
        <Route path="/recipes/:id" element={<RecipeDetails />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/recipes/:id/edit" element={<EditRecipe />} />
          <Route path="/create" element={<CreateRecipe />} />
          <Route path="/change-password" element={<ChangePassword />} />
        </Route>

        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route
            path="/admin/recipe-requests"
            element={<PendingRecipesPage />}
          />
        </Route>
      </Routes>
    </main>
  );
};

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen overflow-x-hidden bg-gray-100">
        <Header />
        <AppRoutes />
      </div>
    </BrowserRouter>
  );
}

export default App;
