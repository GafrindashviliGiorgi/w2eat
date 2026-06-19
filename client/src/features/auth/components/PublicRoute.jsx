import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { useLanguage } from "../../i18n/context/useLanguage";

const PublicRoute = () => {
  const { isAuthenticated, isCheckingAuth } = useAuth();
  const { t } = useLanguage();

  if (isCheckingAuth) {
    return <p className="py-10 text-center">{t("Checking session...")}</p>;
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default PublicRoute;
