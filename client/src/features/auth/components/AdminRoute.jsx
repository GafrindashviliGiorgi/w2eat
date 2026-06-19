import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { useLanguage } from "../../i18n/context/useLanguage";

const AdminRoute = () => {
  const location = useLocation();
  const { isAuthenticated, isCheckingAuth, user } = useAuth();
  const { t } = useLanguage();

  if (isCheckingAuth) {
    return <p className="py-10 text-center">{t("Checking session...")}</p>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (user?.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;
